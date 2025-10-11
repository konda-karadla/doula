import { useQuery } from '@tanstack/react-query';
import { insightsService } from '../lib/api/services';

/**
 * Hook to fetch user's health score
 * Following monorepo pattern: services in api-client, hooks in app
 */
export function useHealthScore() {
  return useQuery({
    queryKey: ['insights', 'health-score'],
    queryFn: () => insightsService.getHealthScore(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

