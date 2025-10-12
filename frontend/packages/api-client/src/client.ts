import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@health-platform/config';
import type { ApiError } from '@health-platform/types';

// Token storage utilities
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.appConfig.auth.tokenStorageKey);
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.appConfig.auth.refreshTokenStorageKey);
};

const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(config.appConfig.auth.tokenStorageKey, token);
};

const setRefreshToken = (refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(config.appConfig.auth.refreshTokenStorageKey, refreshToken);
};

const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(config.appConfig.auth.tokenStorageKey);
  localStorage.removeItem(config.appConfig.auth.refreshTokenStorageKey);
  localStorage.removeItem(config.appConfig.auth.userStorageKey);
};

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.appConfig.api.baseUrl,
    timeout: config.appConfig.api.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullUrl: `${config.baseURL}${config.url}`,
        hasToken: !!token,
        headers: config.headers,
      });
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );

  // Response interceptor to handle token refresh
  client.interceptors.response.use(
    (response) => {
      console.log('[API Response]', {
        status: response.status,
        url: response.config.url,
        dataLength: JSON.stringify(response.data).length,
      });
      return response;
    },
    async (error) => {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
      });
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            const response = await axios.post(
              `${config.appConfig.api.baseUrl}/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            setToken(accessToken);
            setRefreshToken(newRefreshToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          console.error('[Token Refresh Failed]', refreshError);
          removeTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError instanceof Error ? refreshError : new Error('Token refresh failed'));
        }
      }

      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );

  return client;
};

// API client instance
export const apiClient = createApiClient();

// Generic API request function
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'An error occurred',
        error: error.response?.data?.error || 'Internal Server Error',
      };
      console.error('[apiRequest] Error converted to ApiError:', apiError);
      throw apiError;
    }
    console.error('[apiRequest] Non-Axios error:', error);
    throw error;
  }
};

// HTTP methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
  
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

// File upload utility
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest({
    method: 'POST',
    url,
    data: formData,
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
};

// Export token management utilities
export const tokenManager = {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  removeTokens,
  isAuthenticated: () => !!getToken(),
};
