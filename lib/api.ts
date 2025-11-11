import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  CancelTokenSource,
} from "axios";
import { ApiResponse } from "@/types";

/**
 * Extended request config with custom properties
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
}

/**
 * Configuration options for the API client
 */
export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  token?: string | (() => string | null);
  onRequest?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  onResponse?: (
    response: AxiosResponse
  ) => AxiosResponse | Promise<AxiosResponse>;
  onError?: (error: AxiosError) => void | Promise<void>;
  retry?: {
    retries: number;
    retryDelay?: number | ((retryCount: number) => number);
    retryCondition?: (error: AxiosError) => boolean;
  };
}

/**
 * Request options that extend AxiosRequestConfig
 */
export interface RequestOptions<T = unknown>
  extends Omit<AxiosRequestConfig, "data"> {
  data?: T;
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  transformResponse?: (data: unknown) => unknown;
  requestId?: string;
}

/**
 * API Client interface
 */
export interface ApiClient {
  get: <T = unknown>(
    url: string,
    options?: Omit<RequestOptions, "data">
  ) => Promise<ApiResponse<T>>;
  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    options?: RequestOptions<D>
  ) => Promise<ApiResponse<T>>;
  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    options?: RequestOptions<D>
  ) => Promise<ApiResponse<T>>;
  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    options?: RequestOptions<D>
  ) => Promise<ApiResponse<T>>;
  delete: <T = unknown>(
    url: string,
    options?: RequestOptions
  ) => Promise<ApiResponse<T>>;
  head: <T = unknown>(
    url: string,
    options?: Omit<RequestOptions, "data">
  ) => Promise<ApiResponse<T>>;
  options: <T = unknown>(
    url: string,
    options?: Omit<RequestOptions, "data">
  ) => Promise<ApiResponse<T>>;
  cancelRequest: (requestId: string) => void;
  cancelAllRequests: () => void;
  setToken: (token: string | (() => string | null)) => void;
  clearToken: () => void;
  updateConfig: (config: Partial<ApiConfig>) => void;
  getInstance: () => AxiosInstance;
}

/**
 * Create a retry delay function
 */
const createRetryDelay = (
  retryDelay: number | ((retryCount: number) => number) | undefined,
  retryCount: number
): number => {
  if (typeof retryDelay === "function") {
    return retryDelay(retryCount);
  }
  return retryDelay || 1000 * retryCount;
};

/**
 * Check if request should be retried
 */
const shouldRetry = (
  error: AxiosError,
  retryConfig?: ApiConfig["retry"]
): boolean => {
  if (!retryConfig) return false;

  const retryCondition =
    retryConfig.retryCondition ||
    ((err: AxiosError) => {
      return (
        !err.response ||
        (err.response.status >= 500 && err.response.status < 600)
      );
    });

  return retryCondition(error);
};

/**
 * Retry a failed request
 */
const retryRequest = async (
  error: AxiosError,
  instance: AxiosInstance,
  retryConfig: ApiConfig["retry"]
): Promise<AxiosResponse> => {
  const config = error.config as ExtendedAxiosRequestConfig & {
    __retryCount?: number;
  };

  if (!config || !retryConfig) {
    return Promise.reject(error);
  }

  config.__retryCount = config.__retryCount || 0;

  if (config.__retryCount >= retryConfig.retries) {
    return Promise.reject(error);
  }

  config.__retryCount += 1;
  const delay = createRetryDelay(retryConfig.retryDelay, config.__retryCount);

  await new Promise((resolve) => setTimeout(resolve, delay));

  return instance.request(config);
};

/**
 * Setup interceptors for axios instance
 */
const setupInterceptors = (
  instance: AxiosInstance,
  config: ApiConfig
): void => {
  // Request interceptor
  instance.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
      const extendedConfig = requestConfig as ExtendedAxiosRequestConfig;

      // Add auth token if available
      if (!extendedConfig.skipAuth && config.token) {
        const token =
          typeof config.token === "function" ? config.token() : config.token;

        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Custom request transformation
      if (config.onRequest) {
        return await config.onRequest(requestConfig);
      }

      return requestConfig;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    async (response: AxiosResponse) => {
      // Custom response transformation
      if (config.onResponse) {
        return await config.onResponse(response);
      }
      return response;
    },
    async (error: AxiosError) => {
      const extendedConfig = error.config as
        | ExtendedAxiosRequestConfig
        | undefined;

      // Custom error handling
      if (config.onError && !extendedConfig?.skipErrorHandling) {
        await config.onError(error);
      }

      // Retry logic
      if (config.retry && shouldRetry(error, config.retry)) {
        return retryRequest(error, instance, config.retry);
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Create an API client with the given configuration
 */
export function createApiClient(initialConfig: ApiConfig = {}): ApiClient {
  // Mutable config that can be updated
  let config: ApiConfig = {
    baseURL: initialConfig.baseURL || process.env.NEXT_PUBLIC_API_URL || "",
    timeout: initialConfig.timeout || 30000,
    headers: {
      "Content-Type": "application/json",
      ...initialConfig.headers,
    },
    withCredentials: initialConfig.withCredentials ?? false,
    ...initialConfig,
  };

  // Cancel token sources map
  const cancelTokenSources = new Map<string, CancelTokenSource>();

  // Create axios instance
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
    withCredentials: config.withCredentials,
  });

  // Setup interceptors
  setupInterceptors(instance, config);

  /**
   * Get cancel token for a request
   */
  const getCancelToken = (
    requestId?: string
  ):
    | {
        cancelToken: ReturnType<typeof axios.CancelToken.source>["token"];
        cancel: () => void;
      }
    | undefined => {
    if (!requestId) return undefined;

    const source = axios.CancelToken.source();
    cancelTokenSources.set(requestId, source);

    return {
      cancelToken: source.token,
      cancel: () => {
        source.cancel(`Request ${requestId} was cancelled`);
        cancelTokenSources.delete(requestId);
      },
    };
  };

  /**
   * Generic request method
   */
  const request = async <T = unknown>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS",
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      data,
      skipAuth,
      skipErrorHandling,
      transformResponse,
      requestId,
      ...axiosConfig
    } = options;

    const cancelTokenInfo = getCancelToken(requestId);

    try {
      const requestConfig = {
        method,
        url,
        data,
        cancelToken: cancelTokenInfo?.cancelToken,
        skipAuth,
        skipErrorHandling,
        ...axiosConfig,
      } as ExtendedAxiosRequestConfig;

      const response = await instance.request<T>(requestConfig);

      let responseData = response.data;

      // Apply custom transformation if provided
      if (transformResponse) {
        responseData = transformResponse(responseData) as T;
      }

      // Clean up cancel token
      if (requestId && cancelTokenInfo) {
        cancelTokenSources.delete(requestId);
      }

      // Return standardized response
      return {
        success: true,
        data: responseData,
        message: (responseData as { message?: string })?.message,
      };
    } catch (error) {
      // Clean up cancel token on error
      if (requestId && cancelTokenInfo) {
        cancelTokenSources.delete(requestId);
      }

      const axiosError = error as AxiosError;

      // Handle cancellation
      if (axios.isCancel(error)) {
        return {
          success: false,
          error: "Request was cancelled",
        };
      }

      // Extract error message
      const errorData = axiosError.response?.data as
        | { message?: string; error?: string }
        | undefined;
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        axiosError.message ||
        "An error occurred";

      return {
        success: false,
        error: errorMessage,
        data: axiosError.response?.data as T | undefined,
      };
    }
  };

  // Return API client object
  return {
    get: <T = unknown>(url: string, options?: Omit<RequestOptions, "data">) =>
      request<T>("GET", url, options),

    post: <T = unknown, D = unknown>(
      url: string,
      data?: D,
      options?: RequestOptions<D>
    ) => request<T>("POST", url, { ...options, data }),

    put: <T = unknown, D = unknown>(
      url: string,
      data?: D,
      options?: RequestOptions<D>
    ) => request<T>("PUT", url, { ...options, data }),

    patch: <T = unknown, D = unknown>(
      url: string,
      data?: D,
      options?: RequestOptions<D>
    ) => request<T>("PATCH", url, { ...options, data }),

    delete: <T = unknown>(url: string, options?: RequestOptions) =>
      request<T>("DELETE", url, options),

    head: <T = unknown>(url: string, options?: Omit<RequestOptions, "data">) =>
      request<T>("HEAD", url, options),

    options: <T = unknown>(
      url: string,
      options?: Omit<RequestOptions, "data">
    ) => request<T>("OPTIONS", url, options),

    cancelRequest: (requestId: string) => {
      const source = cancelTokenSources.get(requestId);
      if (source) {
        source.cancel(`Request ${requestId} was cancelled`);
        cancelTokenSources.delete(requestId);
      }
    },

    cancelAllRequests: () => {
      cancelTokenSources.forEach((source, id) => {
        source.cancel(`Request ${id} was cancelled`);
      });
      cancelTokenSources.clear();
    },

    setToken: (token: string | (() => string | null)) => {
      config.token = token;
    },

    clearToken: () => {
      config.token = undefined;
    },

    updateConfig: (newConfig: Partial<ApiConfig>) => {
      config = { ...config, ...newConfig };

      if (newConfig.baseURL) {
        instance.defaults.baseURL = newConfig.baseURL;
      }
      if (newConfig.timeout) {
        instance.defaults.timeout = newConfig.timeout;
      }
      if (newConfig.headers) {
        instance.defaults.headers = {
          ...instance.defaults.headers,
          ...newConfig.headers,
        };
      }
      if (newConfig.token !== undefined) {
        config.token = newConfig.token;
      }
    },

    getInstance: () => instance,
  };
}

/**
 * Get authentication token from localStorage
 * Checks multiple common storage patterns
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // Check for token in common storage locations
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  if (token) return token;

  // Check if token is stored in user object
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr) as {
        token?: string;
        accessToken?: string;
      };
      return user.token || user.accessToken || null;
    } catch {
      // Invalid JSON, ignore
    }
  }

  return null;
};

// Default API client instance
let defaultClient: ApiClient | null = null;

/**
 * Initialize the default API client
 */
export function initApi(config?: ApiConfig): ApiClient {
  // Automatically set up token retrieval if not provided
  const apiConfig: ApiConfig = {
    ...config,
    token: config?.token || getAuthToken,
  };

  defaultClient = createApiClient(apiConfig);
  return defaultClient;
}

/**
 * Get or create the default API client
 */
export function getApi(): ApiClient {
  if (!defaultClient) {
    // Automatically configure token retrieval from localStorage
    defaultClient = createApiClient({
      token: getAuthToken,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }
  return defaultClient;
}

/**
 * Default API client - ready to use out of the box
 * Automatically sends tokens if user is logged in
 */
export const api = getApi();
