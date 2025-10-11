import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { LoginRequest, RegisterRequest } from '@health-platform/types';
import { useAuthStore } from '../stores/auth';
import { authService } from '../lib/api/services';
import { tokenStorage } from '../lib/storage/token-storage';

/**
 * Authentication Actions Hook
 * Combines Zustand stores with React Query mutations
 * Handles login, register, and logout with token persistence
 */
export function useAuthActions() {
  const router = useRouter();
  const { setAuth, logout: logoutStore, setLoading, setError } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      setLoading(true);
      return authService.login(credentials);
    },
    onSuccess: async (data) => {
      if (data.user) {
        // Save tokens to secure storage
        await tokenStorage.setAccessToken(data.accessToken);
        await tokenStorage.setRefreshToken(data.refreshToken);
        await tokenStorage.setUser(data.user);

        // Update auth store
        setAuth(data.user, data.accessToken, data.refreshToken);
        
        // Navigate to main app
        router.replace('/(tabs)');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Login failed');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      setLoading(true);
      return authService.register(userData);
    },
    onSuccess: async (data) => {
      if (data.user) {
        // Save tokens to secure storage
        await tokenStorage.setAccessToken(data.accessToken);
        await tokenStorage.setRefreshToken(data.refreshToken);
        await tokenStorage.setUser(data.user);

        // Update auth store
        setAuth(data.user, data.accessToken, data.refreshToken);
        
        // Navigate to main app
        router.replace('/(tabs)');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Registration failed');
    },
  });

  // Logout action
  const logout = async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout API error:', error);
    } finally {
      // Clear tokens and state regardless of API response
      await tokenStorage.clearAll();
      logoutStore();
      router.replace('/(auth)/login');
    }
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
}

