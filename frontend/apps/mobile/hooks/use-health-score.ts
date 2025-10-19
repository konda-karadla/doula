import { useQuery } from '@tanstack/react-query';
import { insightsService } from '../lib/api/services';
import { USE_MOCK_DATA, mockHealthScore } from '../__mocks__/mock-data';

/**
 * Hook to fetch user's health score
 * Following monorepo pattern: services in api-client, hooks in app
 */
export function useHealthScore() {
  return useQuery({
    queryKey: ['insights', 'health-score'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 700));
        return mockHealthScore;
      }
      return insightsService.getHealthScore();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

