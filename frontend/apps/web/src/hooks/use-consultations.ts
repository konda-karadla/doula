import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@health-platform/api-client';
import { useAuthStore } from '@/lib/stores/auth';
import type {
  BookConsultationRequest,
  RescheduleConsultationRequest,
} from '@health-platform/types';

// Query keys
export const consultationKeys = {
  all: ['consultations'] as const,
  doctors: () => [...consultationKeys.all, 'doctors'] as const,
  doctor: (id: string) => [...consultationKeys.doctors(), id] as const,
  availability: (id: string, date: string) => [...consultationKeys.doctor(id), 'availability', date] as const,
  myBookings: () => [...consultationKeys.all, 'my-bookings'] as const,
  detail: (id: string) => [...consultationKeys.all, 'detail', id] as const,
};

// Fetch all doctors (user view)
export function useDoctors() {
  return useQuery({
    queryKey: consultationKeys.doctors(),
    queryFn: () => services.consultations.getDoctors(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single doctor
export function useDoctor(id: string) {
  return useQuery({
    queryKey: consultationKeys.doctor(id),
    queryFn: () => services.consultations.getDoctor(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch doctor availability for a specific date
export function useDoctorAvailability(doctorId: string, date: string) {
  return useQuery({
    queryKey: consultationKeys.availability(doctorId, date),
    queryFn: () => services.consultations.getAvailability(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 1 * 60 * 1000, // 1 minute (real-time availability)
  });
}

// Book consultation
export function useBookConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookConsultationRequest) =>
      services.consultations.book(data),
    onSuccess: () => {
      // Invalidate my bookings to show new consultation
      queryClient.invalidateQueries({ queryKey: consultationKeys.myBookings() });
    },
  });
}

// Fetch user's consultations
export function useMyConsultations() {
  const { isAuthenticated, token } = useAuthStore();
  
  return useQuery({
    queryKey: consultationKeys.myBookings(),
    queryFn: () => services.consultations.getMyBookings(),
    enabled: isAuthenticated && !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Fetch single consultation
export function useConsultation(id: string) {
  const { isAuthenticated, token } = useAuthStore();
  
  return useQuery({
    queryKey: consultationKeys.detail(id),
    queryFn: () => services.consultations.get(id),
    enabled: !!id && isAuthenticated && !!token,
    staleTime: 2 * 60 * 1000,
  });
}

// Reschedule consultation
export function useRescheduleConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleConsultationRequest }) =>
      services.consultations.reschedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: consultationKeys.myBookings() });
    },
  });
}

// Cancel consultation
export function useCancelConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => services.consultations.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: consultationKeys.myBookings() });
    },
  });
}

