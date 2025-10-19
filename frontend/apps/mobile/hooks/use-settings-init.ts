import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settings';
import { settingsStorage } from '../lib/storage/settings-storage';

/**
 * Settings Initialization Hook
 * Restores app settings from AsyncStorage on launch
 */
export function useSettingsInit() {
  useEffect(() => {
    let isMounted = true;

    const initSettings = async () => {
      try {
        const [theme, language, biometric, onboarding, offlineMode] = await Promise.all([
          settingsStorage.getTheme(),
          settingsStorage.getLanguage(),
          settingsStorage.getBiometricEnabled(),
          settingsStorage.getOnboardingComplete(),
          settingsStorage.getOfflineMode(),
        ]);

        if (isMounted) {
          const store = useSettingsStore.getState();
          
          if (theme) store.setTheme(theme);
          if (language) store.setLanguage(language);
          store.setBiometric(biometric);
          store.setOnboardingComplete(onboarding);
          store.setOfflineMode(offlineMode);
          
          console.log('⚙️ Settings restored from AsyncStorage');
        }
      } catch (error) {
        console.error('Error initializing settings:', error);
      }
    };

    initSettings();

    return () => {
      isMounted = false;
    };
  }, []);
}

