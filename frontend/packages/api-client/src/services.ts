import { api, uploadFile, tokenManager } from './client';
import { apiEndpoints, config } from '@health-platform/config';
import type {
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
  HealthScore,
  UserProfile,
  HealthStats,
  Doctor,
  Consultation,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  CreateAvailabilityRequest,
  BookConsultationRequest,
  UpdateConsultationRequest,
  RescheduleConsultationRequest,
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
  
  list: (filters?: { search?: string; status?: string }): Promise<LabResult[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${apiEndpoints.labs.list}?${queryString}` : apiEndpoints.labs.list;
    return api.get<LabResult[]>(url);
  },
  
  get: (id: string): Promise<LabResult> =>
    api.get<LabResult>(apiEndpoints.labs.get(id)),
  
  getBiomarkers: (id: string): Promise<Biomarker[]> =>
    api.get<Biomarker[]>(apiEndpoints.labs.biomarkers(id)),
  
  delete: (id: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(apiEndpoints.labs.delete(id)),
};

// Action Plans Service
export const actionPlanService = {
  list: (filters?: { search?: string; status?: string }): Promise<ActionPlan[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${apiEndpoints.actionPlans.list}?${queryString}` : apiEndpoints.actionPlans.list;
    return api.get<ActionPlan[]>(url);
  },
  
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
  
  getHealthScore: (): Promise<HealthScore> =>
    api.get<HealthScore>(apiEndpoints.insights.healthScore),
};

// User Profile Service
export const profileService = {
  get: (): Promise<UserProfile> =>
    api.get<UserProfile>(apiEndpoints.profile.get),
  
  getStats: (): Promise<HealthStats> =>
    api.get<HealthStats>(apiEndpoints.profile.stats),

  update: (data: Partial<{ email: string; profileType: string; journeyType: string }>): Promise<UserProfile> =>
    api.patch<UserProfile>(apiEndpoints.profile.update, data),
  
  export: async (type: string, format: string): Promise<Blob> => {
    const token = tokenManager.getToken();
    const response = await fetch(`${config.appConfig.api.baseUrl}${apiEndpoints.profile.export(type, format)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },
};

// Admin Service
export const adminService = {
  // User Management
  getAllUsers: (): Promise<any[]> =>
    api.get<any[]>(apiEndpoints.admin.users),
  
  getUserById: (id: string): Promise<any> =>
    api.get<any>(apiEndpoints.admin.user(id)),
  
  createUser: (data: any): Promise<any> =>
    api.post<any>(apiEndpoints.admin.createUser, data),
  
  updateUser: (id: string, data: any): Promise<any> =>
    api.put<any>(apiEndpoints.admin.updateUser(id), data),
  
  deleteUser: (id: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(apiEndpoints.admin.deleteUser(id)),
  
  // System Configuration
  getSystemConfig: (): Promise<any> =>
    api.get<any>(apiEndpoints.admin.systemConfig),
  
  updateSystemConfig: (data: any): Promise<any> =>
    api.put<any>(apiEndpoints.admin.updateSystemConfig, data),
  
  // Analytics
  getUserAnalytics: (): Promise<any> =>
    api.get<any>(apiEndpoints.admin.analytics.users),
  
  getLabAnalytics: (): Promise<any> =>
    api.get<any>(apiEndpoints.admin.analytics.labs),
  
  getActionPlanAnalytics: (): Promise<any> =>
    api.get<any>(apiEndpoints.admin.analytics.actionPlans),
  
  // Action Plans (Admin)
  getAllActionPlans: (): Promise<any[]> =>
    api.get<any[]>(apiEndpoints.admin.actionPlans.list),
  
  getActionPlanById: (id: string): Promise<any> =>
    api.get<any>(apiEndpoints.admin.actionPlans.get(id)),

  getActionPlanItems: (id: string): Promise<any[]> =>
    api.get<any[]>(apiEndpoints.admin.actionPlans.items(id)),
  
  createActionPlanForUser: (data: any): Promise<any> =>
    api.post<any>(apiEndpoints.admin.actionPlans.create, data),

  updateActionPlan: (id: string, data: any): Promise<any> =>
    api.put<any>(apiEndpoints.admin.actionPlans.update(id), data),

  deleteActionPlan: (id: string): Promise<void> =>
    api.delete(apiEndpoints.admin.actionPlans.delete(id)),
};

// Consultation Service (User)
export const consultationService = {
  // Browse doctors
  getDoctors: (): Promise<Doctor[]> =>
    api.get<Doctor[]>(apiEndpoints.consultations.doctors),
  
  getDoctor: (id: string): Promise<Doctor> =>
    api.get<Doctor>(apiEndpoints.consultations.doctor(id)),
  
  getAvailability: (id: string, date: string): Promise<string[]> =>
    api.get<string[]>(apiEndpoints.consultations.availability(id, date)),
  
  // Book consultations
  book: (data: BookConsultationRequest): Promise<Consultation> =>
    api.post<Consultation>(apiEndpoints.consultations.book, data),
  
  // Manage consultations
  getMyBookings: (): Promise<Consultation[]> =>
    api.get<Consultation[]>(apiEndpoints.consultations.myBookings),
  
  get: (id: string): Promise<Consultation> =>
    api.get<Consultation>(apiEndpoints.consultations.get(id)),
  
  reschedule: (id: string, data: RescheduleConsultationRequest): Promise<Consultation> =>
    api.put<Consultation>(apiEndpoints.consultations.reschedule(id), data),
  
  cancel: (id: string): Promise<Consultation> =>
    api.delete<Consultation>(apiEndpoints.consultations.cancel(id)),
};

// Admin Consultation Service
export const adminConsultationService = {
  // Doctor management
  getDoctors: (): Promise<Doctor[]> =>
    api.get<Doctor[]>(apiEndpoints.admin.consultations.doctors),
  
  getDoctor: (id: string): Promise<Doctor> =>
    api.get<Doctor>(apiEndpoints.admin.consultations.doctor(id)),
  
  createDoctor: (data: CreateDoctorRequest): Promise<Doctor> =>
    api.post<Doctor>(apiEndpoints.admin.consultations.createDoctor, data),
  
  updateDoctor: (id: string, data: UpdateDoctorRequest): Promise<Doctor> =>
    api.put<Doctor>(apiEndpoints.admin.consultations.updateDoctor(id), data),
  
  deleteDoctor: (id: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(apiEndpoints.admin.consultations.deleteDoctor(id)),
  
  toggleDoctor: (id: string): Promise<Doctor> =>
    api.put<Doctor>(apiEndpoints.admin.consultations.toggleDoctor(id)),
  
  setAvailability: (id: string, data: CreateAvailabilityRequest[]): Promise<Doctor> =>
    api.post<Doctor>(apiEndpoints.admin.consultations.availability(id), data),
  
  // Consultation management
  getConsultations: (): Promise<Consultation[]> =>
    api.get<Consultation[]>(apiEndpoints.admin.consultations.consultations),
  
  getConsultation: (id: string): Promise<Consultation> =>
    api.get<Consultation>(apiEndpoints.admin.consultations.consultation(id)),
  
  updateConsultation: (id: string, data: UpdateConsultationRequest): Promise<Consultation> =>
    api.put<Consultation>(apiEndpoints.admin.consultations.updateConsultation(id), data),
};

// Export all services
export const services = {
  auth: authService,
  labs: labService,
  actionPlans: actionPlanService,
  actionItems: actionItemService,
  insights: insightsService,
  profile: profileService,
  admin: adminService,
  consultations: consultationService,
  adminConsultations: adminConsultationService,
};
