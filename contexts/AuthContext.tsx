"use client";

import { AuthResponseDto, User, UserProfile, Wallet, AddBalanceResponse } from "@/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ) => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  getWallet: () => Promise<Wallet>;
  addBalance: (userId: string, amount: number) => Promise<AddBalanceResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If unauthorized, clear stored data
        if (response.status === 401) {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      if (result.success && result.data) {
        const profileData: UserProfile = result.data;
        
        // Convert UserProfile to User format
        const user: User = {
          id: profileData.id,
          name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          email: profileData.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          isActive: profileData.isActive,
          lastLoginAt: profileData.lastLoginAt,
          memberSince: new Date(profileData.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          }),
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
          preferredCurrency: profileData.preferredCurrency,
          preferences: profileData.preferences,
          totalEsims: 0, // Will be populated from other endpoints if available
          activeEsims: 0, // Will be populated from other endpoints if available
        };

        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (error) {
      console.error("Fetch user profile error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (storedUser && token) {
        // Set stored user immediately for faster UI
        setUser(JSON.parse(storedUser));
        // Then fetch fresh profile data
        await fetchUserProfile();
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Use the local API proxy to avoid CORS issues
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const authData: AuthResponseDto = await response.json();

      // Set user data from AuthResponseDto
      const user: User = {
        id: authData.id,
        name: `${authData.firstName} ${authData.lastName}`.trim(),
        email: authData.email,
        memberSince: authData.createdAt.toString(),
        totalEsims: 0, // Will be populated from profile API later
        activeEsims: 0, // Will be populated from profile API later
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      // Store access token
      localStorage.setItem("token", authData.accessToken);

      // Fetch full user profile
      await fetchUserProfile();
    } catch (error) {
      console.error("Login fetch error:", error);

      if (error instanceof Error) {
        // If it's already a proper Error with a message, throw it as is
        if (error.message.includes("API URL is not configured")) {
          throw error;
        }
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          throw new Error(
            "Unable to connect to the server. Please check if the API server is running and NEXT_PUBLIC_API_URL is correctly configured."
          );
        }
        if (error.message.includes("CORS")) {
          throw new Error(
            "CORS error: Backend does not allow requests from this origin. Please check backend CORS configuration."
          );
        }
        throw error;
      }

      // For unknown errors, provide a generic message
      throw new Error(
        "An unexpected error occurred during login. Please try again."
      );
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ) => {
    try {
      // Use the local API proxy to avoid CORS issues
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const authData: AuthResponseDto = await response.json();

      // Set user data from AuthResponseDto
      const user: User = {
        id: authData.id,
        name: `${authData.firstName} ${authData.lastName}`.trim(),
        email: authData.email,
        memberSince: authData.createdAt.toString(),
        totalEsims: 0, // Will be populated from profile API later
        activeEsims: 0, // Will be populated from profile API later
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      // Store access token
      localStorage.setItem("token", authData.accessToken);

      // Fetch full user profile
      await fetchUserProfile();
    } catch (error) {
      console.error("Register fetch error:", error);

      if (error instanceof Error) {
        // If it's already a proper Error with a message, throw it as is
        if (error.message.includes("API URL is not configured")) {
          throw error;
        }
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          throw new Error(
            "Unable to connect to the server. Please check if the API server is running and NEXT_PUBLIC_API_URL is correctly configured."
          );
        }
        if (error.message.includes("CORS")) {
          throw new Error(
            "CORS error: Backend does not allow requests from this origin. Please check backend CORS configuration."
          );
        }
        throw error;
      }

      // For unknown errors, provide a generic message
      throw new Error(
        "An unexpected error occurred during registration. Please try again."
      );
    }
  };

  const logout = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      
      // Call the logout API endpoint to invalidate the session on the backend
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        console.warn('Logout API call failed, but proceeding with local logout');
      }
    } catch (error) {
      console.warn('Logout API call error, but proceeding with local logout:', error);
    }

    // Clear user data and tokens from local storage
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to change your password");
      }

      const response = await fetch("/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Password changed successfully
      return;
    } catch (error) {
      console.error("Change password error:", error);
      
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "An unexpected error occurred while changing password. Please try again."
      );
    }
  };

  const getWallet = async (): Promise<Wallet> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to view your wallet");
      }

      const response = await fetch("/api/wallet/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }

      throw new Error("Failed to fetch wallet data");
    } catch (error) {
      console.error("Get wallet error:", error);
      
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "An unexpected error occurred while fetching wallet. Please try again."
      );
    }
  };

  const addBalance = async (
    userId: string,
    amount: number
  ): Promise<AddBalanceResponse> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to add balance");
      }

      if (!userId || !amount || amount <= 0) {
        throw new Error("Valid user ID and positive amount are required");
      }

      const response = await fetch("/api/wallet/add-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, amount }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }

      throw new Error("Failed to add balance");
    } catch (error) {
      console.error("Add balance error:", error);
      
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "An unexpected error occurred while adding balance. Please try again."
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        fetchUserProfile,
        changePassword,
        getWallet,
        addBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
