import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@health-platform/api-client';
import type {
  CreateDoctorRequest,
  UpdateDoctorRequest,
  CreateAvailabilityRequest,
} from '@health-platform/types';

// Query keys
export const doctorKeys = {
  all: ['admin', 'doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters?: any) => [...doctorKeys.lists(), { filters }] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
};

// Fetch all doctors (admin)
export function useAdminDoctors() {
  return useQuery({
    queryKey: doctorKeys.lists(),
    queryFn: () => services.adminConsultations.getDoctors(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Fetch single doctor (admin)
export function useAdminDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => services.adminConsultations.getDoctor(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create doctor
export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDoctorRequest) =>
      services.adminConsultations.createDoctor(data),
    onSuccess: () => {
      // Invalidate and refetch doctors list
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
}

// Update doctor
export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorRequest }) =>
      services.adminConsultations.updateDoctor(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific doctor and list
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
}

// Delete doctor
export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => services.adminConsultations.deleteDoctor(id),
    onSuccess: () => {
      // Invalidate doctors list
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
}

// Toggle doctor active status
export function useToggleDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => services.adminConsultations.toggleDoctor(id),
    onSuccess: (_, id) => {
      // Invalidate specific doctor and list
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
}

// Set doctor availability
export function useSetAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, availability }: { id: string; availability: CreateAvailabilityRequest[] }) =>
      services.adminConsultations.setAvailability(id, availability),
    onSuccess: (_, variables) => {
      // Invalidate specific doctor
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
}

