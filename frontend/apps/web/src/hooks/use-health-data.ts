import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/stores/auth'

// Mock data - in real implementation, these would come from API
const mockHealthStats = {
  healthScore: 85,
  healthScoreChange: 2,
  labResults: 12,
  labResultsPending: 3,
  actionPlans: 5,
  actionPlansInProgress: 2,
  profileComplete: true
}

const mockRecentLabs = [
  {
    id: '1',
    title: 'Complete Blood Count',
    description: 'Latest blood work results',
    type: 'lab_result' as const,
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    href: '/lab-results/1',
    actionLabel: 'View',
    onAction: () => console.log('View lab result')
  },
  {
    id: '2',
    title: 'Lipid Panel',
    description: 'Cholesterol and lipid levels',
    type: 'lab_result' as const,
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    href: '/lab-results/2',
    actionLabel: 'View',
    onAction: () => console.log('View lab result')
  }
]

const mockRecentActionPlans = [
  {
    id: '1',
    title: 'Nutrition Optimization',
    description: '5 items remaining',
    type: 'action_plan' as const,
    status: 'pending' as const,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    href: '/action-plans/1',
    actionLabel: 'Continue',
    onAction: () => console.log('Continue action plan')
  },
  {
    id: '2',
    title: 'Exercise Routine',
    description: '2 items remaining',
    type: 'action_plan' as const,
    status: 'pending' as const,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    href: '/action-plans/2',
    actionLabel: 'Continue',
    onAction: () => console.log('Continue action plan')
  }
]

const mockHealthTrends = [
  { name: 'Jan', value: 78 },
  { name: 'Feb', value: 82 },
  { name: 'Mar', value: 80 },
  { name: 'Apr', value: 85 },
  { name: 'May', value: 88 },
  { name: 'Jun', value: 85 }
]

const mockBiomarkerData = [
  { name: 'Cholesterol', value: 180 },
  { name: 'HDL', value: 55 },
  { name: 'LDL', value: 110 },
  { name: 'Triglycerides', value: 120 }
]

export function useHealthStats() {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['health-stats'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return mock data for authenticated users
      return mockHealthStats
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRecentLabResults() {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['recent-lab-results'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
      return mockRecentLabs
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useRecentActionPlans() {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['recent-action-plans'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600))
      return mockRecentActionPlans
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useHealthTrends() {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['health-trends'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1200))
      return mockHealthTrends
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useBiomarkerData() {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['biomarker-data'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 900))
      return mockBiomarkerData
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
