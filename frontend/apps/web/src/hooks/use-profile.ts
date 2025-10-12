import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@health-platform/api-client';
import { useAuthStore } from '@/lib/stores/auth';

export function useProfile() {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log('[useProfile] Fetching profile...', { hasToken: !!token });
      try {
        const result = await services.profile.get();
        console.log('[useProfile] Success:', result);
        return result;
      } catch (error: any) {
        console.error('[useProfile] Error:', {
          message: error.message,
          status: error.statusCode,
          error: error.error,
        });
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if not authenticated
  });
}

export function useProfileStats() {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      console.log('[useProfileStats] Fetching stats...', { hasToken: !!token });
      try {
        const result = await services.profile.getStats();
        console.log('[useProfileStats] Success');
        return result;
      } catch (error: any) {
        console.error('[useProfileStats] Error:', {
          message: error.message,
          status: error.statusCode,
        });
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if not authenticated
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<{
      email: string;
      profileType: string;
      journeyType: string;
      preferences: Record<string, any>;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      dateOfBirth: string;
      healthGoals: string[];
      emergencyContactName: string;
      emergencyContactPhone: string;
    }>) => {
      console.log('[useUpdateProfile] Mutation called with:', data);
      const result = await services.profile.update(data);
      console.log('[useUpdateProfile] Mutation result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('[useUpdateProfile] onSuccess, invalidating cache. New data:', data);
      // Invalidate profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    },
  });
}
