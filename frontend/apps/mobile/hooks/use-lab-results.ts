import { useQuery } from '@tanstack/react-query';
import { labService } from '../lib/api/services';

/**
 * Hook to fetch user's lab results
 */
export function useLabResults() {
  return useQuery({
    queryKey: ['labs', 'list'],
    queryFn: () => labService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a specific lab result
 */
export function useLabResult(id: string) {
  return useQuery({
    queryKey: ['labs', id],
    queryFn: () => labService.get(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

