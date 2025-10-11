import { useQuery } from '@tanstack/react-query';
import { profileService } from '../lib/api/services';

/**
 * Hook to fetch user's health statistics
 */
export function useProfileStats() {
  return useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: () => profileService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

