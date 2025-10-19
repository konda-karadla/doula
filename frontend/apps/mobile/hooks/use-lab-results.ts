import { useQuery } from '@tanstack/react-query';
import { labService } from '../lib/api/services';
import { USE_MOCK_DATA, mockLabResults, generateMockLabResults } from '../__mocks__/mock-data';

/**
 * Hook to fetch user's lab results
 */
export function useLabResults() {
  return useQuery({
    queryKey: ['labs', 'list'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // Return more items for performance testing
        return generateMockLabResults(20);
        // Or return the default set: return mockLabResults;
      }
      return labService.list();
    },
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
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockLabResults.find(lab => lab.id === id) || mockLabResults[0];
      }
      return labService.get(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

