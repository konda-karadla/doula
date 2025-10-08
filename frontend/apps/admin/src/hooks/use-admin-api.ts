import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { services } from '@health-platform/api-client'
import type { User } from '@health-platform/types'

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

export const useDeleteLabResult = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: services.labs.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labs })
    },
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

export const useDeleteActionPlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: services.actionPlans.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionPlans })
    },
  })
}

export const useActionItems = (planId: string) => {
  return useQuery({
    queryKey: queryKeys.actionItems(planId),
    queryFn: () => services.actionItems.list(planId),
    enabled: !!planId,
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
  const { data: userAnalytics, isLoading: usersLoading } = useUserAnalytics()
  const { data: labAnalytics, isLoading: labsLoading } = useLabAnalytics()
  const { data: planAnalytics, isLoading: plansLoading } = useActionPlanAnalytics()

  return {
    data: {
      totalUsers: userAnalytics?.totalUsers || 0,
      recentRegistrations: userAnalytics?.recentRegistrations || 0,
      labResults: labAnalytics?.totalLabs || 0,
      actionPlans: planAnalytics?.totalPlans || 0,
      processedLabs: labAnalytics?.byStatus?.find((s: { status: string; count: number }) => s.status === 'completed')?.count || 0,
      processingLabs: labAnalytics?.byStatus?.find((s: { status: string; count: number }) => s.status === 'processing')?.count || 0,
      errorLabs: labAnalytics?.byStatus?.find((s: { status: string; count: number }) => s.status === 'failed')?.count || 0,
      completionRate: planAnalytics?.completionRate || 0,
    },
    isLoading: usersLoading || labsLoading || plansLoading,
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

// User Management Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: services.admin.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: adminQueryKeys.user(id),
    queryFn: () => services.admin.getUserById(id),
    enabled: !!id,
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: services.admin.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
    },
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: services.admin.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      services.admin.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
    },
  })
}

export const useSystemConfig = () => {
  return useQuery({
    queryKey: adminQueryKeys.systemConfig,
    queryFn: services.admin.getSystemConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: services.admin.updateSystemConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.systemConfig })
    },
  })
}

// Analytics Hooks
export const useUserAnalytics = () => {
  return useQuery({
    queryKey: [...adminQueryKeys.analytics, 'users'] as const,
    queryFn: services.admin.getUserAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useLabAnalytics = () => {
  return useQuery({
    queryKey: [...adminQueryKeys.analytics, 'labs'] as const,
    queryFn: services.admin.getLabAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useActionPlanAnalytics = () => {
  return useQuery({
    queryKey: [...adminQueryKeys.analytics, 'action-plans'] as const,
    queryFn: services.admin.getActionPlanAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

