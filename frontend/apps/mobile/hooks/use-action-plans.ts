import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { actionPlanService, actionItemService } from '../lib/api/services';
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

/**
 * Hook to complete an action item
 */
export function useCompleteActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, itemId }: { planId: string; itemId: string }) => {
      console.log('[useCompleteActionItem] Starting mutation:', { planId, itemId, mockMode: USE_MOCK_DATA });
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('[useCompleteActionItem] Mock: Completed');
        return { id: itemId, status: 'completed', completedAt: new Date().toISOString() };
      }
      const result = await actionItemService.complete(planId, itemId);
      console.log('[useCompleteActionItem] API success');
      return result;
    },
    onMutate: async (variables) => {
      // Optimistic update for immediate UI feedback
      await queryClient.cancelQueries({ queryKey: ['action-plans', variables.planId] });
      
      const previousPlan = queryClient.getQueryData(['action-plans', variables.planId]);
      
      // Update the cache optimistically
      queryClient.setQueryData(['action-plans', variables.planId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          actionItems: old.actionItems?.map((item: any) =>
            item.id === variables.itemId
              ? { ...item, status: 'completed', completedAt: new Date().toISOString() }
              : item
          ),
        };
      });
      
      console.log('[useCompleteActionItem] Optimistic update applied');
      return { previousPlan };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousPlan) {
        queryClient.setQueryData(['action-plans', variables.planId], context.previousPlan);
      }
    },
    onSuccess: (data, variables) => {
      console.log('[useCompleteActionItem] onSuccess, invalidating cache for planId:', variables.planId);
      // In real API mode, refetch to get latest from server
      if (!USE_MOCK_DATA) {
        queryClient.invalidateQueries({ queryKey: ['action-plans', variables.planId] });
        queryClient.invalidateQueries({ queryKey: ['action-plans', 'list'] });
      }
    },
  });
}

/**
 * Hook to uncomplete an action item
 */
export function useUncompleteActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, itemId }: { planId: string; itemId: string }) => {
      console.log('[useUncompleteActionItem] Starting mutation:', { planId, itemId, mockMode: USE_MOCK_DATA });
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('[useUncompleteActionItem] Mock: Uncompleted');
        return { id: itemId, status: 'pending', completedAt: null };
      }
      const result = await actionItemService.uncomplete(planId, itemId);
      console.log('[useUncompleteActionItem] API success');
      return result;
    },
    onMutate: async (variables) => {
      // Optimistic update for immediate UI feedback
      await queryClient.cancelQueries({ queryKey: ['action-plans', variables.planId] });
      
      const previousPlan = queryClient.getQueryData(['action-plans', variables.planId]);
      
      // Update the cache optimistically
      queryClient.setQueryData(['action-plans', variables.planId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          actionItems: old.actionItems?.map((item: any) =>
            item.id === variables.itemId
              ? { ...item, status: 'pending', completedAt: null }
              : item
          ),
        };
      });
      
      console.log('[useUncompleteActionItem] Optimistic update applied');
      return { previousPlan };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousPlan) {
        queryClient.setQueryData(['action-plans', variables.planId], context.previousPlan);
      }
    },
    onSuccess: (data, variables) => {
      console.log('[useUncompleteActionItem] onSuccess, invalidating cache for planId:', variables.planId);
      // In real API mode, refetch to get latest from server
      if (!USE_MOCK_DATA) {
        queryClient.invalidateQueries({ queryKey: ['action-plans', variables.planId] });
        queryClient.invalidateQueries({ queryKey: ['action-plans', 'list'] });
      }
    },
  });
}

