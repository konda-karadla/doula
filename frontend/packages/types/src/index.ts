// Authentication types
export interface User {
  id: string;
  email: string;
  username: string;
  role?: string;
  systemId: string;
  profileType?: 'patient' | 'provider' | 'admin';
  journeyType?: 'prenatal' | 'postnatal' | 'general';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  systemSlug: string;
  profileType?: 'patient' | 'provider' | 'admin';
  journeyType?: 'prenatal' | 'postnatal' | 'general';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Lab Results types
export interface LabResult {
  id: string;
  fileName: string;
  s3Url: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  rawOcrText?: string;
  uploadedAt: string;
  createdAt: string;
}

export interface Biomarker {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceRangeLow: string;
  referenceRangeHigh: string;
  testDate: string;
  createdAt: string;
}

// Action Plans types
export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
  actionItems?: ActionItem[];
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateActionPlanRequest {
  title: string;
  description: string;
}

export interface UpdateActionPlanRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'paused';
}

export interface CreateActionItemRequest {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

export interface UpdateActionItemRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

// Health Insights types
export interface HealthInsight {
  id: string;
  biomarkerId: string;
  testName: string;
  currentValue: string;
  type: 'low' | 'normal' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  recommendation: string;
  createdAt: string;
}

export interface HealthInsightsSummary {
  totalInsights: number;
  criticalCount: number;
  highPriorityCount: number;
  normalCount: number;
  insights: HealthInsight[];
  lastAnalyzedAt: string;
}

export interface BiomarkerTrend {
  value: string;
  unit: string;
  date: string;
  testName: string;
}

// User Profile types
export interface UserProfile extends User {
  // Extended user profile information
}

export interface HealthStats {
  totalLabResults: number;
  totalActionPlans: number;
  completedActionItems: number;
  pendingActionItems: number;
  criticalInsights: number;
  lastLabUpload?: string;
  lastActionPlanUpdate?: string;
  memberSince: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// Multi-tenant types
export interface System {
  id: string;
  name: string;
  type: 'doula' | 'functional_health' | 'elderly_care';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Common types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'active' | 'completed' | 'paused' | 'pending' | 'processing' | 'failed';
export type ProfileType = 'patient' | 'provider' | 'admin';
export type JourneyType = 'prenatal' | 'postnatal' | 'general';
export type SystemType = 'doula' | 'functional_health' | 'elderly_care';
export type InsightType = 'low' | 'normal' | 'high' | 'critical';

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    input: string;
    ring: string;
  };
  fonts: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}
