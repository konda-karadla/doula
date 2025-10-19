import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@health-platform/api-client';
import type { UpdateConsultationRequest } from '@health-platform/types';

// Query keys
export const consultationKeys = {
  all: ['admin', 'consultations'] as const,
  lists: () => [...consultationKeys.all, 'list'] as const,
  list: (filters?: any) => [...consultationKeys.lists(), { filters }] as const,
  details: () => [...consultationKeys.all, 'detail'] as const,
  detail: (id: string) => [...consultationKeys.details(), id] as const,
};

// Fetch all consultations (admin)
export function useAdminConsultations() {
  return useQuery({
    queryKey: consultationKeys.lists(),
    queryFn: () => services.adminConsultations.getConsultations(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Fetch single consultation (admin)
export function useAdminConsultation(id: string) {
  return useQuery({
    queryKey: consultationKeys.detail(id),
    queryFn: () => services.adminConsultations.getConsultation(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Update consultation
export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConsultationRequest }) =>
      services.adminConsultations.updateConsultation(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific consultation and list
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
  });
}

