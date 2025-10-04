import { api, uploadFile } from './client';
import { apiEndpoints } from '@health-platform/config';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  User,
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
} from '@health-platform/types';

// Authentication Service
export const authService = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post<AuthResponse>(apiEndpoints.auth.login, data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post<AuthResponse>(apiEndpoints.auth.register, data),
  
  refresh: (data: RefreshTokenRequest): Promise<AuthResponse> =>
    api.post<AuthResponse>(apiEndpoints.auth.refresh, data),
  
  logout: (): Promise<{ message: string }> =>
    api.post<{ message: string }>(apiEndpoints.auth.logout),
};

// Lab Results Service
export const labService = {
  upload: (file: File, onProgress?: (progress: number) => void): Promise<LabResult> =>
    uploadFile(apiEndpoints.labs.upload, file, onProgress),
  
  list: (): Promise<LabResult[]> =>
    api.get<LabResult[]>(apiEndpoints.labs.list),
  
  get: (id: string): Promise<LabResult> =>
    api.get<LabResult>(apiEndpoints.labs.get(id)),
  
  getBiomarkers: (id: string): Promise<Biomarker[]> =>
    api.get<Biomarker[]>(apiEndpoints.labs.biomarkers(id)),
  
  delete: (id: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(apiEndpoints.labs.delete(id)),
};

// Action Plans Service
export const actionPlanService = {
  list: (): Promise<ActionPlan[]> =>
    api.get<ActionPlan[]>(apiEndpoints.actionPlans.list),
  
  create: (data: CreateActionPlanRequest): Promise<ActionPlan> =>
    api.post<ActionPlan>(apiEndpoints.actionPlans.create, data),
  
  get: (id: string): Promise<ActionPlan> =>
    api.get<ActionPlan>(apiEndpoints.actionPlans.get(id)),
  
  update: (id: string, data: UpdateActionPlanRequest): Promise<ActionPlan> =>
    api.put<ActionPlan>(apiEndpoints.actionPlans.update(id), data),
  
  delete: (id: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(apiEndpoints.actionPlans.delete(id)),
};

// Action Items Service
export const actionItemService = {
  list: (planId: string): Promise<ActionItem[]> =>
    api.get<ActionItem[]>(apiEndpoints.actionPlans.items.list(planId)),
  
  create: (planId: string, data: CreateActionItemRequest): Promise<ActionItem> =>
    api.post<ActionItem>(apiEndpoints.actionPlans.items.create(planId), data),
  
  get: (planId: string, itemId: string): Promise<ActionItem> =>
    api.get<ActionItem>(apiEndpoints.actionPlans.items.get(planId, itemId)),
  
  update: (planId: string, itemId: string, data: UpdateActionItemRequest): Promise<ActionItem> =>
    api.put<ActionItem>(apiEndpoints.actionPlans.items.update(planId, itemId), data),
  
  complete: (planId: string, itemId: string): Promise<ActionItem> =>
    api.patch<ActionItem>(apiEndpoints.actionPlans.items.complete(planId, itemId)),
  
  uncomplete: (planId: string, itemId: string): Promise<ActionItem> =>
    api.patch<ActionItem>(apiEndpoints.actionPlans.items.uncomplete(planId, itemId)),
  
  delete: (planId: string, itemId: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(apiEndpoints.actionPlans.items.delete(planId, itemId)),
};

// Health Insights Service
export const insightsService = {
  getSummary: (): Promise<HealthInsightsSummary> =>
    api.get<HealthInsightsSummary>(apiEndpoints.insights.summary),
  
  getLabResultInsights: (id: string): Promise<HealthInsight[]> =>
    api.get<HealthInsight[]>(apiEndpoints.insights.labResult(id)),
  
  getTrends: (testName: string): Promise<BiomarkerTrend[]> =>
    api.get<BiomarkerTrend[]>(apiEndpoints.insights.trends(testName)),
};

// User Profile Service
export const profileService = {
  get: (): Promise<UserProfile> =>
    api.get<UserProfile>(apiEndpoints.profile.get),
  
  getStats: (): Promise<HealthStats> =>
    api.get<HealthStats>(apiEndpoints.profile.stats),
};

// Export all services
export const services = {
  auth: authService,
  labs: labService,
  actionPlans: actionPlanService,
  actionItems: actionItemService,
  insights: insightsService,
  profile: profileService,
};
