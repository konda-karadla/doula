import { useQuery } from '@tanstack/react-query';
import { profileService } from '../lib/api/services';
import { USE_MOCK_DATA, mockProfileStats } from '../__mocks__/mock-data';

/**
 * Hook to fetch user's health statistics
 */
export function useProfileStats() {
  return useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProfileStats;
      }
      return profileService.getStats();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

