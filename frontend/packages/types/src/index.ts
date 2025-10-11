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

// Health Score types
export interface CategoryScore {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
}

export interface HealthScore {
  overall: number;
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor';
  categories: {
    metabolic?: CategoryScore;
    cardiovascular?: CategoryScore;
    reproductive?: CategoryScore;
    nutritional?: CategoryScore;
    hormonal?: CategoryScore;
  };
  totalBiomarkers: number;
  criticalCount: number;
  normalCount: number;
  lastUpdated: string;
  trend?: 'improving' | 'stable' | 'declining';
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

// Consultation types
export type ConsultationType = 'VIDEO' | 'PHONE' | 'IN_PERSON';
export type ConsultationStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Doctor {
  id: string;
  systemId: string;
  name: string;
  specialization: string;
  bio?: string;
  qualifications: string[];
  experience: number;
  consultationFee: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  availabilitySlots?: AvailabilitySlot[];
  _count?: {
    consultations: number;
  };
}

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  isActive: boolean;
  createdAt: string;
}

export interface Consultation {
  id: string;
  userId: string;
  doctorId: string;
  scheduledAt: string;
  duration: number;
  type: ConsultationType;
  status: ConsultationStatus;
  meetingLink?: string;
  notes?: string;
  prescription?: string;
  fee: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: string;
    name: string;
    specialization: string;
    imageUrl?: string;
    bio?: string;
    qualifications?: string[];
    experience?: number;
  };
  user?: {
    id: string;
    username: string;
    email: string;
    profileType?: string;
    journeyType?: string;
  };
}

// Consultation Request types
export interface CreateDoctorRequest {
  name: string;
  specialization: string;
  bio?: string;
  qualifications: string[];
  experience: number;
  consultationFee: string;
  imageUrl?: string;
}

export interface UpdateDoctorRequest {
  name?: string;
  specialization?: string;
  bio?: string;
  qualifications?: string[];
  experience?: number;
  consultationFee?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CreateAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface BookConsultationRequest {
  doctorId: string;
  scheduledAt: string;
  duration?: number;
  type?: ConsultationType;
}

export interface UpdateConsultationRequest {
  status?: ConsultationStatus;
  notes?: string;
  prescription?: string;
  meetingLink?: string;
}

export interface RescheduleConsultationRequest {
  scheduledAt: string;
}
