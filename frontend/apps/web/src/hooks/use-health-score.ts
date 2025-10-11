import { useQuery } from '@tanstack/react-query'
import { services } from '@health-platform/api-client'

export function useHealthScore() {
  return useQuery({
    queryKey: ['insights', 'health-score'],
    queryFn: services.insights.getHealthScore,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

