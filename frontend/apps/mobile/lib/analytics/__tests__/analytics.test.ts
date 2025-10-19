import { analytics, AnalyticsEvents, AnalyticsScreens } from '../analytics';

describe('Analytics', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.log to verify analytics tracking
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    analytics.setEnabled(true);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    analytics.clearUser();
  });

  describe('Initialization', () => {
    it('should initialize analytics', () => {
      analytics.initialize();
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Initialized');
    });
  });

  describe('Enable/Disable', () => {
    it('should enable analytics', () => {
      analytics.setEnabled(true);
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Enabled');
    });

    it('should disable analytics', () => {
      analytics.setEnabled(false);
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Disabled');
    });

    it('should not track events when disabled', () => {
      analytics.setEnabled(false);
      consoleSpy.mockClear();
      
      analytics.trackEvent('test_event');
      
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event:')
      );
    });
  });

  describe('User Identification', () => {
    it('should identify user', () => {
      analytics.identifyUser('user-123', { name: 'Test User' });
      
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] User identified:', 'user-123');
    });

    it('should clear user', () => {
      analytics.identifyUser('user-123');
      consoleSpy.mockClear();
      
      analytics.clearUser();
      
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] User cleared');
    });
  });

  describe('Event Tracking', () => {
    it('should track event', () => {
      analytics.trackEvent('button_clicked');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'button_clicked',
        undefined  // No properties passed
      );
    });

    it('should track event with properties', () => {
      const properties = { button_name: 'Submit', screen: 'Login' };
      analytics.trackEvent('button_clicked', properties);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'button_clicked',
        expect.objectContaining(properties)
      );
    });

    it('should track predefined events', () => {
      analytics.trackEvent(AnalyticsEvents.LOGIN_SUCCESS);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'login_success',
        undefined  // No properties passed
      );
    });
  });

  describe('Screen Tracking', () => {
    it('should track screen view', () => {
      analytics.trackScreen('Dashboard');
      
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Screen:', 'Dashboard');
    });

    it('should track screen with properties', () => {
      analytics.trackScreen('Dashboard', { user_type: 'premium' });
      
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Screen:', 'Dashboard');
    });

    it('should track predefined screens', () => {
      analytics.trackScreen(AnalyticsScreens.DASHBOARD);
      
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Screen:', 'Dashboard');
    });
  });

  describe('User Properties', () => {
    it('should set user properties', () => {
      const properties = { plan: 'premium', age: 25 };
      analytics.setUserProperties(properties);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] User properties updated:',
        properties
      );
    });
  });

  describe('Error Tracking', () => {
    it('should track error', () => {
      const error = new Error('Test error');
      analytics.trackError(error);
      
      // trackError uses console.error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Error:',
        'Test error',
        undefined
      );
      
      // It also tracks an event via console.log
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'error',
        expect.objectContaining({
          error_message: 'Test error'
        })
      );
    });

    it('should track error with context', () => {
      const error = new Error('API failed');
      const context = { endpoint: '/api/labs', status: 500 };
      analytics.trackError(error, context);
      
      // trackError uses console.error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Error:',
        'API failed',
        context
      );
      
      // It also tracks an event with combined properties
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'error',
        expect.objectContaining({
          error_message: 'API failed',
          ...context
        })
      );
    });
  });

  describe('Timing Tracking', () => {
    it('should track timing', () => {
      analytics.trackTiming('page_load', 'Dashboard', 1500);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Timing:',
        'page_load',
        'Dashboard',
        1500
      );
    });

    it('should track timing with label', () => {
      analytics.trackTiming('api_call', 'GET /labs', 250, 'success');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Timing:',
        'api_call',
        'GET /labs',
        250
      );
    });
  });
});

