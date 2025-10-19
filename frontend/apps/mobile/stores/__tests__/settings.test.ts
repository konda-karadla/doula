import { useSettingsStore } from '../settings';

describe('Settings Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useSettingsStore.getState().reset();
  });

  it('should have initial state', () => {
    const state = useSettingsStore.getState();
    
    expect(state.theme).toBe('auto');
    expect(state.language).toBe('en');
    expect(state.biometricEnabled).toBe(false);
    expect(state.hasCompletedOnboarding).toBe(false);
    expect(state.offlineMode).toBe(true); // Default is true
    expect(state.cacheEnabled).toBe(true);
  });

  it('should update theme', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('should update language', () => {
    useSettingsStore.getState().setLanguage('es');
    expect(useSettingsStore.getState().language).toBe('es');
  });

  it('should enable biometric', () => {
    expect(useSettingsStore.getState().biometricEnabled).toBe(false);

    useSettingsStore.getState().setBiometric(true);
    expect(useSettingsStore.getState().biometricEnabled).toBe(true);
  });

  it('should disable biometric', () => {
    useSettingsStore.getState().setBiometric(true);
    expect(useSettingsStore.getState().biometricEnabled).toBe(true);

    useSettingsStore.getState().setBiometric(false);
    expect(useSettingsStore.getState().biometricEnabled).toBe(false);
  });

  it('should mark onboarding as completed', () => {
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(false);

    useSettingsStore.getState().setOnboardingComplete(true);
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('should toggle offline mode', () => {
    // Default is true
    expect(useSettingsStore.getState().offlineMode).toBe(true);

    useSettingsStore.getState().setOfflineMode(false);
    expect(useSettingsStore.getState().offlineMode).toBe(false);

    useSettingsStore.getState().setOfflineMode(true);
    expect(useSettingsStore.getState().offlineMode).toBe(true);
  });

  it('should enable cache', () => {
    useSettingsStore.getState().setCacheEnabled(true);
    expect(useSettingsStore.getState().cacheEnabled).toBe(true);

    useSettingsStore.getState().setCacheEnabled(false);
    expect(useSettingsStore.getState().cacheEnabled).toBe(false);
  });

  it('should handle multiple theme changes', () => {
    const themes = ['light', 'dark', 'auto'] as const;
    
    themes.forEach(theme => {
      useSettingsStore.getState().setTheme(theme);
      expect(useSettingsStore.getState().theme).toBe(theme);
    });
  });

  it('should handle multiple language changes', () => {
    const languages = ['en', 'es', 'fr'] as const;
    
    languages.forEach(lang => {
      useSettingsStore.getState().setLanguage(lang);
      expect(useSettingsStore.getState().language).toBe(lang);
    });
  });
});

