/**
 * Analytics Wrapper
 * 
 * Provides a unified interface for tracking events, screens, and user properties.
 * Can be easily connected to analytics services like:
 * - Expo Analytics
 * - Firebase Analytics
 * - Mixpanel
 * - Amplitude
 * - Custom backend analytics
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

class Analytics {
  private isEnabled: boolean = true;
  private userId: string | null = null;
  private userProperties: UserProperties = {};

  /**
   * Initialize analytics
   */
  initialize() {
    console.log('[Analytics] Initialized');
    // TODO: Initialize your analytics service here
    // Example: await analytics.initializeAsync();
  }

  /**
   * Enable/disable analytics tracking
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`[Analytics] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Identify the current user
   */
  identifyUser(userId: string, properties?: UserProperties) {
    if (!this.isEnabled) return;

    this.userId = userId;
    this.userProperties = { ...properties, userId };

    console.log('[Analytics] User identified:', userId);
    // TODO: Send to analytics service
    // Example: analytics.identify(userId, properties);
  }

  /**
   * Clear user identity (on logout)
   */
  clearUser() {
    console.log('[Analytics] User cleared');
    this.userId = null;
    this.userProperties = {};
    // TODO: Clear user in analytics service
    // Example: analytics.reset();
  }

  /**
   * Track an event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    console.log('[Analytics] Event:', eventName, properties);
    // TODO: Send to analytics service
    // Example: analytics.logEvent(eventName, properties);
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    console.log('[Analytics] Screen:', screenName);
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
    // TODO: Send to analytics service
    // Example: analytics.setCurrentScreen(screenName);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties) {
    if (!this.isEnabled) return;

    this.userProperties = { ...this.userProperties, ...properties };
    console.log('[Analytics] User properties updated:', properties);
    // TODO: Send to analytics service
    // Example: analytics.setUserProperties(properties);
  }

  /**
   * Track timing/performance metrics
   */
  trackTiming(category: string, name: string, duration: number, label?: string) {
    if (!this.isEnabled) return;

    console.log('[Analytics] Timing:', category, name, duration);
    this.trackEvent('timing', {
      category,
      name,
      duration,
      label,
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: Record<string, any>) {
    if (!this.isEnabled) return;

    console.error('[Analytics] Error:', error.message, context);
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error);
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) =>
  analytics.trackEvent(name, properties);

export const trackScreen = (name: string, properties?: Record<string, any>) =>
  analytics.trackScreen(name, properties);

export const identifyUser = (userId: string, properties?: UserProperties) =>
  analytics.identifyUser(userId, properties);

export const clearUser = () => analytics.clearUser();

export const setUserProperties = (properties: UserProperties) =>
  analytics.setUserProperties(properties);

export const trackError = (error: Error, context?: Record<string, any>) =>
  analytics.trackError(error, context);

export const trackTiming = (category: string, name: string, duration: number, label?: string) =>
  analytics.trackTiming(category, name, duration, label);

// Common event tracking helpers
export const AnalyticsEvents = {
  // Auth events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  REGISTER_SUCCESS: 'register_success',
  REGISTER_FAILED: 'register_failed',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  BIOMETRIC_DISABLED: 'biometric_disabled',
  BIOMETRIC_LOGIN_SUCCESS: 'biometric_login_success',
  BIOMETRIC_LOGIN_FAILED: 'biometric_login_failed',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // Lab Results
  LAB_RESULT_VIEWED: 'lab_result_viewed',
  LAB_RESULT_UPLOADED: 'lab_result_uploaded',
  LAB_RESULT_UPLOAD_FAILED: 'lab_result_upload_failed',
  LAB_RESULT_SHARED: 'lab_result_shared',

  // Action Plans
  ACTION_PLAN_VIEWED: 'action_plan_viewed',
  ACTION_PLAN_CREATED: 'action_plan_created',
  ACTION_PLAN_UPDATED: 'action_plan_updated',
  ACTION_PLAN_COMPLETED: 'action_plan_completed',
  ACTION_ITEM_COMPLETED: 'action_item_completed',

  // Health Insights
  HEALTH_SCORE_VIEWED: 'health_score_viewed',
  INSIGHTS_VIEWED: 'insights_viewed',

  // Settings
  THEME_CHANGED: 'theme_changed',
  LANGUAGE_CHANGED: 'language_changed',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  NOTIFICATIONS_DISABLED: 'notifications_disabled',

  // Network
  NETWORK_OFFLINE: 'network_offline',
  NETWORK_ONLINE: 'network_online',

  // Errors
  API_ERROR: 'api_error',
  APP_ERROR: 'app_error',
};

// Screen names
export const AnalyticsScreens = {
  SPLASH: 'Splash',
  ONBOARDING_WELCOME: 'Onboarding_Welcome',
  ONBOARDING_FEATURES: 'Onboarding_Features',
  ONBOARDING_READY: 'Onboarding_Ready',
  LOGIN: 'Login',
  REGISTER: 'Register',
  DASHBOARD: 'Dashboard',
  LAB_RESULTS: 'Lab_Results',
  LAB_RESULT_DETAIL: 'Lab_Result_Detail',
  ACTION_PLANS: 'Action_Plans',
  ACTION_PLAN_DETAIL: 'Action_Plan_Detail',
  HEALTH_INSIGHTS: 'Health_Insights',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
};

