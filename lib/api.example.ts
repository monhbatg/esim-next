/**
 * API Helper Usage Examples
 * 
 * This file demonstrates the flexibility of the API helper.
 * You can use it in various ways depending on your needs.
 */

import { api, initApi, createApiClient, ApiClient } from './api';

// ============================================================================
// Example 1: Simple usage with default client
// ============================================================================

export async function simpleGetExample() {
  const response = await api.get<User>('/users/1');
  
  if (response.success) {
    console.log('User:', response.data);
  } else {
    console.error('Error:', response.error);
  }
}

export async function simplePostExample() {
  const response = await api.post<User, LoginFormData>('/auth/login', {
    email: 'user@example.com',
    password: 'password123',
  });
  
  if (response.success) {
    console.log('Logged in:', response.data);
  }
}

// ============================================================================
// Example 2: Initialize with custom configuration
// ============================================================================

export function initializeWithConfig() {
  initApi({
    baseURL: 'https://api.example.com/v1',
    timeout: 10000,
    headers: {
      'X-Custom-Header': 'value',
    },
    token: () => {
      // Get token from localStorage or context
      return localStorage.getItem('authToken');
    },
    onRequest: (config) => {
      // Add custom logic before request
      console.log('Making request to:', config.url);
      return config;
    },
    onResponse: (response) => {
      // Transform response if needed
      console.log('Received response:', response.status);
      return response;
    },
    onError: (error) => {
      // Global error handling
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        window.location.href = '/login';
      }
    },
    retry: {
      retries: 3,
      retryDelay: (retryCount) => 1000 * retryCount, // Exponential backoff
      retryCondition: (error) => {
        // Only retry on network errors or 5xx errors
        return !error.response || (error.response.status >= 500);
      },
    },
  });
}

// ============================================================================
// Example 3: Create multiple API clients for different services
// ============================================================================

export const authApi: ApiClient = createApiClient({
  baseURL: 'https://auth.example.com',
  timeout: 5000,
});

export const paymentApi: ApiClient = createApiClient({
  baseURL: 'https://payment.example.com',
  timeout: 30000,
  headers: {
    'X-API-Key': process.env.NEXT_PUBLIC_PAYMENT_API_KEY || '',
  },
});

// Usage:
// await authApi.post('/login', credentials);
// await paymentApi.post('/charge', paymentData);

// ============================================================================
// Example 4: Request cancellation
// ============================================================================

export async function cancellableRequest() {
  const requestId = 'user-search-123';
  
  // Make request with cancellation support
  const responsePromise = api.get('/users/search', {
    requestId,
    params: { q: 'john' },
  });
  
  // Cancel if needed (e.g., user navigates away)
  // api.cancelRequest(requestId);
  
  const response = await responsePromise;
  return response;
}

// ============================================================================
// Example 5: Custom response transformation
// ============================================================================

export async function transformResponseExample() {
  const response = await api.get('/api/data', {
    transformResponse: (data) => {
      // Transform the response data structure
      const typedData = data as { results: unknown[]; count: number };
      return {
        items: typedData.results,
        total: typedData.count,
      };
    },
  });
  
  return response;
}

// ============================================================================
// Example 6: Skip authentication for public endpoints
// ============================================================================

export async function publicEndpointExample() {
  const response = await api.get('/public/data', {
    skipAuth: true,
  });
  
  return response;
}

// ============================================================================
// Example 7: Custom error handling per request
// ============================================================================

export async function customErrorHandlingExample() {
  const response = await api.post('/sensitive-action', {
    data: { action: 'delete' },
    skipErrorHandling: true, // Skip global error handler
  });
  
  // Handle error manually
  if (!response.success) {
    // Custom error handling logic
    console.error('Custom error:', response.error);
  }
  
  return response;
}

// ============================================================================
// Example 8: All HTTP methods
// ============================================================================

export async function allMethodsExample() {
  // GET
  await api.get('/users');
  
  // POST
  await api.post('/users', { name: 'John', email: 'john@example.com' });
  
  // PUT (full update)
  await api.put('/users/1', { name: 'John Doe', email: 'john@example.com' });
  
  // PATCH (partial update)
  await api.patch('/users/1', { name: 'John Doe' });
  
  // DELETE
  await api.delete('/users/1');
  
  // HEAD
  await api.head('/users/1');
  
  // OPTIONS
  await api.options('/users');
}

// ============================================================================
// Example 9: Automatic token management (default behavior)
// ============================================================================

// The API helper automatically checks localStorage for tokens on each request!
// It looks for tokens in these locations (in order):
// 1. localStorage.getItem('token')
// 2. localStorage.getItem('authToken')
// 3. localStorage.getItem('accessToken')
// 4. JSON.parse(localStorage.getItem('user'))?.token
// 5. JSON.parse(localStorage.getItem('user'))?.accessToken

// So you can just use the API and tokens are sent automatically:
export async function automaticTokenExample() {
  // If user is logged in and token is in localStorage, it's sent automatically!
  const response = await api.get('/protected-endpoint');
  // No need to manually set tokens - it's automatic!
  return response;
}

// Manual token management (if needed):
export function manualTokenManagementExample() {
  // Set a specific token
  api.setToken('your-auth-token');
  
  // Or use a custom function for dynamic token retrieval
  api.setToken(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token || null;
  });
  
  // Clear token (stop sending tokens)
  api.clearToken();
}

// ============================================================================
// Example 10: Update configuration at runtime
// ============================================================================

export function updateConfigExample() {
  // Update base URL
  api.updateConfig({
    baseURL: 'https://new-api.example.com',
  });
  
  // Update timeout
  api.updateConfig({
    timeout: 15000,
  });
  
  // Update headers
  api.updateConfig({
    headers: {
      'X-New-Header': 'value',
    },
  });
}

// ============================================================================
// Example 11: Using in React components
// ============================================================================

/*
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const response = await api.get<User>(`/users/${userId}`);
      
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'Failed to fetch user');
      }
      setLoading(false);
    }

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return <div>{user.name}</div>;
}
*/

// ============================================================================
// Example 12: Advanced axios configuration
// ============================================================================

export async function advancedConfigExample() {
  // Example: Upload file with FormData
  const formData = new FormData();
  formData.append('file', new Blob(['file content']), 'filename.txt');
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 seconds for file upload
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
  
  return response;
}

// Type imports for examples
interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

