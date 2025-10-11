import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { LoginRequest, RegisterRequest } from '@health-platform/types';
import { useAuthStore } from '../stores/auth';
import { useSettingsStore } from '../stores/settings';
import { authService } from '../lib/api/services';
import { tokenStorage } from '../lib/storage/token-storage';
import { checkBiometricCapability } from '../lib/biometric/biometric-auth';

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
        console.log('✅ Login successful, saving credentials...');
        
        // Save tokens to secure storage
        await tokenStorage.setAccessToken(data.accessToken);
        await tokenStorage.setRefreshToken(data.refreshToken);
        await tokenStorage.setUser(data.user);
        
        console.log('✅ Credentials saved to SecureStore');

        // Update auth store
        setAuth(data.user, data.accessToken, data.refreshToken);
        
        // Enable biometric if available and not already enabled
        const capability = await checkBiometricCapability();
        console.log('🔐 Biometric capability:', capability);
        
        if (capability.isAvailable) {
          useSettingsStore.getState().setBiometric(true);
          console.log('✅ Biometric enabled');
        }
        
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
        console.log('✅ Registration successful, saving credentials...');
        
        // Save tokens to secure storage
        await tokenStorage.setAccessToken(data.accessToken);
        await tokenStorage.setRefreshToken(data.refreshToken);
        await tokenStorage.setUser(data.user);
        
        console.log('✅ Credentials saved to SecureStore');

        // Update auth store
        setAuth(data.user, data.accessToken, data.refreshToken);
        
        // Enable biometric if available
        const capability = await checkBiometricCapability();
        if (capability.isAvailable) {
          useSettingsStore.getState().setBiometric(true);
          console.log('✅ Biometric enabled');
        }
        
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
    const { biometricEnabled } = useSettingsStore.getState();
    
    try {
      // Only call backend logout if biometric is disabled
      // If biometric enabled, keep server session active for quick re-login
      if (!biometricEnabled) {
        await authService.logout();
        // Clear everything if biometric disabled
        await tokenStorage.clearAll();
        console.log('✅ Full logout (biometric disabled)');
      } else {
        // If biometric enabled, only clear access token
        // Keep refresh token and user for biometric re-login
        await tokenStorage.deleteAccessToken();
        console.log('✅ Soft logout (keeping credentials for biometric)');
      }
    } catch (error) {
      // On error, clear everything to be safe
      console.error('Logout API error:', error);
      await tokenStorage.clearAll();
    } finally {
      // Always clear client-side auth state
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

