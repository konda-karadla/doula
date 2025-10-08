import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { services } from '@health-platform/api-client'

// Query keys
const queryKeys = {
  labs: ['labs'] as const,
  lab: (id: string) => ['labs', id] as const,
  labBiomarkers: (id: string) => ['labs', id, 'biomarkers'] as const,
  actionPlans: ['action-plans'] as const,
  actionPlan: (id: string) => ['action-plans', id] as const,
  actionItems: (planId: string) => ['action-plans', planId, 'items'] as const,
  insights: ['insights'] as const,
  profile: ['profile'] as const,
  profileStats: ['profile', 'stats'] as const,
}

// Lab Results Hooks
export const useLabResults = () => {
  return useQuery({
    queryKey: queryKeys.labs,
    queryFn: services.labs.list,
    staleTime: 5 * 60 * 1000,
  })
}

export const useLabResult = (id: string) => {
  return useQuery({
    queryKey: queryKeys.lab(id),
    queryFn: () => services.labs.get(id),
    enabled: !!id,
  })
}

export const useLabBiomarkers = (id: string) => {
  return useQuery({
    queryKey: queryKeys.labBiomarkers(id),
    queryFn: () => services.labs.getBiomarkers(id),
    enabled: !!id,
  })
}

// Action Plans Hooks
export const useActionPlans = () => {
  return useQuery({
    queryKey: queryKeys.actionPlans,
    queryFn: services.actionPlans.list,
    staleTime: 5 * 60 * 1000,
  })
}

export const useActionPlan = (id: string) => {
  return useQuery({
    queryKey: queryKeys.actionPlan(id),
    queryFn: () => services.actionPlans.get(id),
    enabled: !!id,
  })
}

// Insights Hook  
export const useInsightsSummary = () => {
  return useQuery({
    queryKey: queryKeys.insights,
    queryFn: services.insights.getSummary,
    staleTime: 5 * 60 * 1000,
  })
}

// Admin-specific query keys
export const adminQueryKeys = {
  users: ['admin', 'users'] as const,
  user: (id: string) => ['admin', 'users', id] as const,
  systemConfig: ['admin', 'system-config'] as const,
  analytics: ['admin', 'analytics'] as const,
  allLabResults: ['admin', 'all-labs'] as const,
  allActionPlans: ['admin', 'all-action-plans'] as const,
} as const

// Admin Dashboard Statistics Hook
export const useAdminStats = () => {
  const { data: labs, isLoading: labsLoading } = useLabResults()
  const { data: actionPlans, isLoading: plansLoading } = useActionPlans()
  const { data: insights } = useInsightsSummary()

  return {
    data: {
      totalUsers: 1234, // Mock - will need backend endpoint
      labResults: labs?.length || 0,
      actionPlans: actionPlans?.length || 0,
      activeSessions: 45, // Mock - will need backend endpoint
      processedLabs: labs?.filter(lab => lab.processingStatus === 'completed').length || 0,
      processingLabs: labs?.filter(lab => lab.processingStatus === 'processing').length || 0,
      errorLabs: labs?.filter(lab => lab.processingStatus === 'failed').length || 0,
    },
    isLoading: labsLoading || plansLoading,
  }
}

// Admin Recent Activities Hook
export const useRecentActivities = () => {
  const { data: labs } = useLabResults()
  const { data: actionPlans } = useActionPlans()

  const activities = []

  // Add recent lab uploads
  if (labs) {
    const recentLabs = labs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 3)
      .map(lab => ({
        id: `lab-${lab.id}`,
        type: 'lab_upload' as const,
        description: `Lab results uploaded: ${lab.fileName}`,
        timestamp: new Date(lab.uploadedAt),
      }))
    activities.push(...recentLabs)
  }

  // Add recent action plans
  if (actionPlans) {
    const recentPlans = actionPlans
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
      .map(plan => ({
        id: `plan-${plan.id}`,
        type: 'action_plan' as const,
        description: `Action plan created: ${plan.title}`,
        timestamp: new Date(plan.createdAt),
      }))
    activities.push(...recentPlans)
  }

  // Sort by timestamp
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5)
}

// Mock User Management Hooks (until backend endpoints are created)
export const useUsers = () => {
  return useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: async () => {
      // Mock data - will need actual endpoint: GET /admin/users
      await new Promise(resolve => setTimeout(resolve, 500))
      return [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          system: 'doula',
          status: 'active',
          createdAt: '2024-01-15',
          lastLogin: '2024-01-20',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          system: 'functional_health',
          status: 'active',
          createdAt: '2024-01-10',
          lastLogin: '2024-01-19',
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@example.com',
          system: 'elderly_care',
          status: 'inactive',
          createdAt: '2024-01-05',
          lastLogin: '2024-01-15',
        },
        {
          id: '4',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          system: 'doula',
          status: 'active',
          createdAt: '2024-01-12',
          lastLogin: '2024-01-20',
        },
      ]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      // Mock delete - will need actual endpoint: DELETE /admin/users/:id
      await new Promise(resolve => setTimeout(resolve, 500))
      return { message: 'User deleted successfully' }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
    },
  })
}

export const useSystemConfig = () => {
  return useQuery({
    queryKey: adminQueryKeys.systemConfig,
    queryFn: async () => {
      // Mock config - will need actual endpoint: GET /admin/system-config
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        general: {
          platformName: 'Health Platform',
          supportEmail: 'support@healthplatform.com',
          maxFileSize: '10',
          sessionTimeout: '30',
        },
        features: {
          userRegistration: true,
          labUpload: true,
          actionPlans: true,
          notifications: true,
          analytics: true,
          darkMode: false,
        },
        systems: {
          doula: {
            enabled: true,
            name: 'Doula Care System',
            description: 'Comprehensive doula and fertility care platform',
            primaryColor: '#3B82F6',
          },
          functional_health: {
            enabled: true,
            name: 'Functional Health System',
            description: 'Advanced functional medicine and wellness platform',
            primaryColor: '#8B5CF6',
          },
          elderly_care: {
            enabled: true,
            name: 'Elderly Care System',
            description: 'Specialized care platform for elderly patients',
            primaryColor: '#F59E0B',
          },
        },
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (config: any) => {
      // Mock update - will need actual endpoint: PUT /admin/system-config
      await new Promise(resolve => setTimeout(resolve, 1000))
      return config
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.systemConfig })
    },
  })
}

