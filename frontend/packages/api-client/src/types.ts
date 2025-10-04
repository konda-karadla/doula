// Re-export types from the main types package
export type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LabResult,
  Biomarker,
  ActionPlan,
  ActionItem,
  CreateActionPlanRequest,
  UpdateActionPlanRequest,
  CreateActionItemRequest,
  UpdateActionItemRequest,
  HealthInsightsSummary,
  HealthInsight,
  BiomarkerTrend,
  UserProfile,
  HealthStats,
  ApiError,
  Priority,
  Status,
  ProfileType,
  JourneyType,
  SystemType,
  InsightType,
} from '@health-platform/types';

// API Client specific types
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  onUploadProgress?: (progress: UploadProgress) => void;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
}

export interface MutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

// Error types
export interface ApiClientError extends Error {
  statusCode?: number;
  response?: {
    data: any;
    status: number;
    statusText: string;
  };
  request?: any;
}

// Token management types
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

// File upload types
export interface FileUploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export interface FileUploadResponse {
  id: string;
  fileName: string;
  s3Url: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
}

// Cache types
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
  storage: 'memory' | 'localStorage' | 'sessionStorage';
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Request/Response interceptors types
export interface RequestInterceptor {
  onFulfilled?: (config: any) => any;
  onRejected?: (error: any) => any;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: any) => any;
  onRejected?: (error: any) => any;
}

// Retry configuration
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  maxDelay: number;
  retryCondition?: (error: any) => boolean;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

// Analytics and tracking types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
}

export interface PerformanceMetrics {
  requestTime: number;
  responseTime: number;
  dataSize: number;
  cacheHit: boolean;
}

// WebSocket types (for real-time updates)
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
