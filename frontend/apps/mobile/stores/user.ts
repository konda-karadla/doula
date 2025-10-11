import { create } from 'zustand';
import type { UserProfile, HealthStats } from '@health-platform/types';

interface UserState {
  // State
  profile: UserProfile | null;
  healthStats: HealthStats | null;
  isLoading: boolean;
  error: string | null;
  lastSyncedAt: string | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  setHealthStats: (stats: HealthStats) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setLastSynced: (timestamp: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  // Initial state
  profile: null,
  healthStats: null,
  isLoading: false,
  error: null,
  lastSyncedAt: null,

  // Actions
  setProfile: (profile) =>
    set({
      profile,
      error: null,
    }),

  setHealthStats: (healthStats) =>
    set({
      healthStats,
    }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  clearError: () =>
    set({
      error: null,
    }),

  setLastSynced: (timestamp) =>
    set({
      lastSyncedAt: timestamp,
    }),

  reset: () =>
    set({
      profile: null,
      healthStats: null,
      isLoading: false,
      error: null,
      lastSyncedAt: null,
    }),
}));

