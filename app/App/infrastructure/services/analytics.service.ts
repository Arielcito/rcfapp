import analytics from '@react-native-firebase/analytics';

const isDebug = __DEV__;

// Disable analytics collection in debug mode
if (isDebug) {
  analytics().setAnalyticsCollectionEnabled(false);
}

export const AnalyticsService = {
  // Log a basic event
  logEvent: async (eventName: string, params?: Record<string, any>) => {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  // Log screen view
  logScreen: async (screenName: string, screenClass?: string) => {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.error('Screen logging error:', error);
    }
  },

  // Log user properties
  setUserProperty: async (name: string, value: string) => {
    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.error('User property error:', error);
    }
  },

  // Authentication events
  auth: {
    logLogin: async (method: string, success: boolean, error?: string) => {
      try {
        await analytics().logEvent('user_login', {
          method,
          success,
          error: error || null,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Login analytics error:', err);
      }
    },

    logRegistration: async (method: string, success: boolean, error?: string) => {
      try {
        await analytics().logEvent('user_registration', {
          method,
          success,
          error: error || null,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Registration analytics error:', err);
      }
    },

    logLogout: async () => {
      try {
        await analytics().logEvent('user_logout', {
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Logout analytics error:', err);
      }
    },
  },
}; 