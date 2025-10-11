import { useQuery } from '@tanstack/react-query';
import { actionPlanService } from '../lib/api/services';

/**
 * Hook to fetch user's action plans
 */
export function useActionPlans() {
  return useQuery({
    queryKey: ['action-plans', 'list'],
    queryFn: () => actionPlanService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a specific action plan
 */
export function useActionPlan(id: string) {
  return useQuery({
    queryKey: ['action-plans', id],
    queryFn: () => actionPlanService.get(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

