import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';

// Mock profile data - in real implementation, this would come from API
const mockProfile = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  profileType: 'patient' as const,
  journeyType: 'general' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStats = {
  totalLabResults: 5,
  totalActionPlans: 3,
  completedActionItems: 8,
  pendingActionItems: 4,
  criticalInsights: 2,
  lastLabUpload: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
  lastActionPlanUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  memberSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
};

export function useProfile() {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation:
      // const response = await apiClient.profile.get()
      // return response.data
      
      return mockProfile;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProfileStats() {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real implementation:
      // const response = await apiClient.profile.getStats()
      // return response.data
      
      return mockStats;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
