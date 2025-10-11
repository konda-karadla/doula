import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { tokenStorage } from '../storage/token-storage';
import { useAuthStore } from '../../stores/auth';
import type { ApiError } from '@health-platform/types';

// Get API base URL from environment or use default
// Note: For mobile development, use your computer's IP address, not localhost
// TODO: Set up expo-constants for proper environment variable handling
const API_BASE_URL = 'http://192.168.1.165:3002'; // Your computer's IP
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Mobile API Client with automatic token management
 * Handles authentication, token refresh, and request/response interceptors
 */
class MobileApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Skip token refresh for auth endpoints (login, register, refresh)
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                               originalRequest.url?.includes('/auth/register') ||
                               originalRequest.url?.includes('/auth/refresh');

        // Handle 401 errors (unauthorized) - but not for auth endpoints
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await tokenStorage.getRefreshToken();

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Attempt to refresh the token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Save new tokens
            await tokenStorage.setAccessToken(accessToken);
            await tokenStorage.setRefreshToken(newRefreshToken);

            // Update auth store
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);

            // Process queued requests
            this.processQueue(null, accessToken);

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            this.processQueue(refreshError, null);
            await this.handleAuthFailure();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async handleAuthFailure() {
    // Clear all tokens
    await tokenStorage.clearAll();

    // Reset auth store
    useAuthStore.getState().logout();

    // Note: Navigation will be handled by the navigation guard in index.tsx
  }

  private normalizeError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const data = error.response.data as any;
      return {
        statusCode: error.response.status,
        message: data.message || error.message || 'An error occurred',
        error: data.error || 'Internal Server Error',
      };
    }

    return {
      statusCode: error.response?.status || 500,
      message: error.message || 'Network error',
      error: 'NetworkError',
    };
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload with progress
  async uploadFile(
    url: string,
    file: any,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Get base URL
  getBaseURL(): string {
    return API_BASE_URL;
  }
}

// Export singleton instance
export const mobileApiClient = new MobileApiClient();

// Export convenience methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => mobileApiClient.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => mobileApiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => mobileApiClient.put<T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => mobileApiClient.patch<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => mobileApiClient.delete<T>(url, config),
  uploadFile: (url: string, file: any, onProgress?: (progress: number) => void) => 
    mobileApiClient.uploadFile(url, file, onProgress),
};

