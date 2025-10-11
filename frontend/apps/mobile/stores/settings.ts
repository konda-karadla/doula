import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es' | 'fr';

interface NotificationSettings {
  enabled: boolean;
  labResults: boolean;
  actionPlanReminders: boolean;
  healthInsights: boolean;
  weeklyReports: boolean;
}

interface SettingsState {
  // State
  theme: ThemeMode;
  language: Language;
  notifications: NotificationSettings;
  biometricEnabled: boolean;
  hasCompletedOnboarding: boolean;
  cacheEnabled: boolean;
  offlineMode: boolean;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setNotifications: (notifications: Partial<NotificationSettings>) => void;
  toggleNotification: (key: keyof NotificationSettings) => void;
  setBiometric: (enabled: boolean) => void;
  setOnboardingComplete: (completed: boolean) => void;
  setCacheEnabled: (enabled: boolean) => void;
  setOfflineMode: (enabled: boolean) => void;
  reset: () => void;
}

const defaultNotifications: NotificationSettings = {
  enabled: true,
  labResults: true,
  actionPlanReminders: true,
  healthInsights: true,
  weeklyReports: false,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  // Initial state
  theme: 'auto',
  language: 'en',
  notifications: defaultNotifications,
  biometricEnabled: false,
  hasCompletedOnboarding: false,
  cacheEnabled: true,
  offlineMode: true,

  // Actions
  setTheme: (theme) =>
    set({
      theme,
    }),

  setLanguage: (language) =>
    set({
      language,
    }),

  setNotifications: (notifications) =>
    set((state) => ({
      notifications: { ...state.notifications, ...notifications },
    })),

  toggleNotification: (key) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: !state.notifications[key],
      },
    })),

  setBiometric: (biometricEnabled) =>
    set({
      biometricEnabled,
    }),

  setOnboardingComplete: (hasCompletedOnboarding) =>
    set({
      hasCompletedOnboarding,
    }),

  setCacheEnabled: (cacheEnabled) =>
    set({
      cacheEnabled,
    }),

  setOfflineMode: (offlineMode) =>
    set({
      offlineMode,
    }),

  reset: () =>
    set({
      theme: 'auto',
      language: 'en',
      notifications: defaultNotifications,
      biometricEnabled: false,
      hasCompletedOnboarding: false,
      cacheEnabled: true,
      offlineMode: true,
    }),
}));

