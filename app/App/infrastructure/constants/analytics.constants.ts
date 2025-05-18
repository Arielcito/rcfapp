export const AnalyticsEvents = {
  AUTH: {
    LOGIN: 'user_login',
    REGISTRATION: 'user_registration',
    LOGOUT: 'user_logout',
  },
  SCREEN_VIEW: 'screen_view',
} as const;

export const AnalyticsParams = {
  AUTH: {
    METHOD: 'method',
    SUCCESS: 'success',
    ERROR: 'error',
    TIMESTAMP: 'timestamp',
  },
  SCREEN: {
    NAME: 'screen_name',
    CLASS: 'screen_class',
  },
} as const;

export const AnalyticsMethods = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
} as const; 