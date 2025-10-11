import { useQuery } from '@tanstack/react-query';
import { actionPlanService } from '../lib/api/services';
import { USE_MOCK_DATA, mockActionPlans, generateMockActionPlans } from '../__mocks__/mock-data';

/**
 * Hook to fetch user's action plans
 */
export function useActionPlans() {
  return useQuery({
    queryKey: ['action-plans', 'list'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        // Return more items for performance testing
        return generateMockActionPlans(15);
        // Or return the default set: return mockActionPlans;
      }
      return actionPlanService.list();
    },
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
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockActionPlans.find(plan => plan.id === id) || mockActionPlans[0];
      }
      return actionPlanService.get(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

