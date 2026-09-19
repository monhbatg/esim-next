export interface EsimClientOptions {
  /** API origin, for example https://api.example.com. */
  baseUrl: string;
  /** Optional bearer token or callback that returns the current token. */
  token?: string | (() => string | null | Promise<string | null>);
  headers?: Record<string, string>;
}

export interface EsimRequestOptions extends RequestInit {
  token?: string | null;
}

export interface EsimResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface EsimClient {
  request<T>(path: string, options?: EsimRequestOptions): Promise<EsimResponse<T>>;
  get<T>(path: string, options?: EsimRequestOptions): Promise<EsimResponse<T>>;
  post<T, B = unknown>(
    path: string,
    body?: B,
    options?: EsimRequestOptions,
  ): Promise<EsimResponse<T>>;
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function createEsimClient(options: EsimClientOptions): EsimClient {
  const request = async <T>(
    path: string,
    requestOptions: EsimRequestOptions = {},
  ): Promise<EsimResponse<T>> => {
    const { token: requestToken, ...fetchOptions } = requestOptions;
    const configuredToken = options.token
      ? await (typeof options.token === "function"
          ? options.token()
          : options.token)
      : null;
    const token = requestToken ?? configuredToken;
    const headers = new Headers(options.headers);

    if (fetchOptions.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(joinUrl(options.baseUrl, path), {
      ...fetchOptions,
      headers,
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof data === "object" && data && "message" in data
          ? String(data.message)
          : `eSIM API request failed with status ${response.status}`;
      throw new Error(message);
    }

    return { data: data as T, status: response.status, headers: response.headers };
  };

  return {
    request,
    get: (path, requestOptions) => request(path, { ...requestOptions, method: "GET" }),
    post: (path, body, requestOptions) =>
      request(path, {
        ...requestOptions,
        method: "POST",
        body: JSON.stringify(body),
      }),
  };
}