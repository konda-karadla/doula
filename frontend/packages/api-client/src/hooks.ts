import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from './services';
import type {
  LoginRequest,
  RegisterRequest,
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
} from '@health-platform/types';

// Query keys
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  
  // Labs
  labs: ['labs'] as const,
  lab: (id: string) => ['labs', id] as const,
  labBiomarkers: (id: string) => ['labs', id, 'biomarkers'] as const,
  
  // Action Plans
  actionPlans: ['actionPlans'] as const,
  actionPlan: (id: string) => ['actionPlans', id] as const,
  actionItems: (planId: string) => ['actionPlans', planId, 'items'] as const,
  actionItem: (planId: string, itemId: string) => ['actionPlans', planId, 'items', itemId] as const,
  
  // Insights
  insights: ['insights'] as const,
  insightsSummary: ['insights', 'summary'] as const,
  labInsights: (id: string) => ['insights', 'lab', id] as const,
  trends: (testName: string) => ['insights', 'trends', testName] as const,
  healthScore: ['insights', 'health-score'] as const,
  
  // Profile
  profile: ['profile'] as const,
  profileStats: ['profile', 'stats'] as const,
} as const;

// Authentication Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.auth.login,
    onSuccess: (data) => {
      // Store tokens and user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('health_platform_token', data.accessToken);
        localStorage.setItem('health_platform_refresh_token', data.refreshToken);
        if (data.user) {
          localStorage.setItem('health_platform_user', JSON.stringify(data.user));
        }
      }
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.auth.register,
    onSuccess: (data) => {
      // Store tokens and user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('health_platform_token', data.accessToken);
        localStorage.setItem('health_platform_refresh_token', data.refreshToken);
        if (data.user) {
          localStorage.setItem('health_platform_user', JSON.stringify(data.user));
        }
      }
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.auth.logout,
    onSuccess: () => {
      // Clear tokens and user data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('health_platform_token');
        localStorage.removeItem('health_platform_refresh_token');
        localStorage.removeItem('health_platform_user');
      }
      // Clear all queries
      queryClient.clear();
    },
  });
};

// Lab Results Hooks
export const useLabResults = () => {
  return useQuery({
    queryKey: queryKeys.labs,
    queryFn: services.labs.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLabResult = (id: string) => {
  return useQuery({
    queryKey: queryKeys.lab(id),
    queryFn: () => services.labs.get(id),
    enabled: !!id,
  });
};

export const useLabBiomarkers = (id: string) => {
  return useQuery({
    queryKey: queryKeys.labBiomarkers(id),
    queryFn: () => services.labs.getBiomarkers(id),
    enabled: !!id,
  });
};

export const useUploadLabResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      services.labs.upload(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labs });
    },
  });
};

export const useDeleteLabResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.labs.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labs });
    },
  });
};

// Action Plans Hooks
export const useActionPlans = () => {
  return useQuery({
    queryKey: queryKeys.actionPlans,
    queryFn: services.actionPlans.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActionPlan = (id: string) => {
  return useQuery({
    queryKey: queryKeys.actionPlan(id),
    queryFn: () => services.actionPlans.get(id),
    enabled: !!id,
  });
};

export const useCreateActionPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.actionPlans.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionPlans });
    },
  });
};

export const useUpdateActionPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActionPlanRequest }) =>
      services.actionPlans.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionPlans });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionPlan(id) });
    },
  });
};

export const useDeleteActionPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.actionPlans.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionPlans });
    },
  });
};

// Action Items Hooks
export const useActionItems = (planId: string) => {
  return useQuery({
    queryKey: queryKeys.actionItems(planId),
    queryFn: () => services.actionItems.list(planId),
    enabled: !!planId,
  });
};

export const useActionItem = (planId: string, itemId: string) => {
  return useQuery({
    queryKey: queryKeys.actionItem(planId, itemId),
    queryFn: () => services.actionItems.get(planId, itemId),
    enabled: !!planId && !!itemId,
  });
};

export const useCreateActionItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: CreateActionItemRequest }) =>
      services.actionItems.create(planId, data),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItems(planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionPlans });
    },
  });
};

export const useUpdateActionItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, itemId, data }: { planId: string; itemId: string; data: UpdateActionItemRequest }) =>
      services.actionItems.update(planId, itemId, data),
    onSuccess: (_, { planId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItems(planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItem(planId, itemId) });
    },
  });
};

export const useCompleteActionItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, itemId }: { planId: string; itemId: string }) =>
      services.actionItems.complete(planId, itemId),
    onSuccess: (_, { planId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItems(planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItem(planId, itemId) });
    },
  });
};

export const useUncompleteActionItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, itemId }: { planId: string; itemId: string }) =>
      services.actionItems.uncomplete(planId, itemId),
    onSuccess: (_, { planId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItems(planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItem(planId, itemId) });
    },
  });
};

export const useDeleteActionItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, itemId }: { planId: string; itemId: string }) =>
      services.actionItems.delete(planId, itemId),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItems(planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionPlans });
    },
  });
};

// Health Insights Hooks
export const useInsightsSummary = () => {
  return useQuery({
    queryKey: queryKeys.insightsSummary,
    queryFn: services.insights.getSummary,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useLabInsights = (id: string) => {
  return useQuery({
    queryKey: queryKeys.labInsights(id),
    queryFn: () => services.insights.getLabResultInsights(id),
    enabled: !!id,
  });
};

export const useBiomarkerTrends = (testName: string) => {
  return useQuery({
    queryKey: queryKeys.trends(testName),
    queryFn: () => services.insights.getTrends(testName),
    enabled: !!testName,
  });
};

export const useHealthScore = () => {
  return useQuery({
    queryKey: queryKeys.healthScore,
    queryFn: services.insights.getHealthScore,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// User Profile Hooks
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: services.profile.get,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProfileStats = () => {
  return useQuery({
    queryKey: queryKeys.profileStats,
    queryFn: services.profile.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Export all hooks
export const hooks = {
  // Auth
  useLogin,
  useRegister,
  useLogout,
  
  // Labs
  useLabResults,
  useLabResult,
  useLabBiomarkers,
  useUploadLabResult,
  useDeleteLabResult,
  
  // Action Plans
  useActionPlans,
  useActionPlan,
  useCreateActionPlan,
  useUpdateActionPlan,
  useDeleteActionPlan,
  
  // Action Items
  useActionItems,
  useActionItem,
  useCreateActionItem,
  useUpdateActionItem,
  useCompleteActionItem,
  useUncompleteActionItem,
  useDeleteActionItem,
  
  // Insights
  useInsightsSummary,
  useLabInsights,
  useBiomarkerTrends,
  useHealthScore,
  
  // Profile
  useProfile,
  useProfileStats,
};
