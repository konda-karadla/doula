import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode, Language } from '../../stores/settings';

const KEYS = {
  THEME: 'health_platform_theme',
  LANGUAGE: 'health_platform_language',
  BIOMETRIC_ENABLED: 'health_platform_biometric',
  ONBOARDING_COMPLETE: 'health_platform_onboarding',
  OFFLINE_MODE: 'health_platform_offline',
} as const;

/**
 * Settings Storage using AsyncStorage
 * Persists app settings across app restarts
 */
export const settingsStorage = {
  // Theme
  async getTheme(): Promise<ThemeMode | null> {
    try {
      const theme = await AsyncStorage.getItem(KEYS.THEME);
      return theme as ThemeMode | null;
    } catch (error) {
      console.error('Error getting theme:', error);
      return null;
    }
  },

  async setTheme(theme: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.THEME, theme);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  },

  // Language
  async getLanguage(): Promise<Language | null> {
    try {
      const language = await AsyncStorage.getItem(KEYS.LANGUAGE);
      return language as Language | null;
    } catch (error) {
      console.error('Error getting language:', error);
      return null;
    }
  },

  async setLanguage(language: Language): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  },

  // Biometric
  async getBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error getting biometric setting:', error);
      return false;
    }
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, String(enabled));
    } catch (error) {
      console.error('Error setting biometric:', error);
    }
  },

  // Onboarding
  async getOnboardingComplete(): Promise<boolean> {
    try {
      const complete = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
      return complete === 'true';
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  },

  async setOnboardingComplete(complete: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, String(complete));
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  },

  // Offline Mode
  async getOfflineMode(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(KEYS.OFFLINE_MODE);
      return enabled !== 'false'; // Default to true
    } catch (error) {
      console.error('Error getting offline mode:', error);
      return true;
    }
  },

  async setOfflineMode(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.OFFLINE_MODE, String(enabled));
    } catch (error) {
      console.error('Error setting offline mode:', error);
    }
  },

  // Clear all settings
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error clearing settings:', error);
    }
  },
};

