import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { monitoringService } from './MonitoringService';

export const initializeMonitoring = async (userId?: string) => {
  // Configuración básica
  monitoringService.setConfig({
    enableCrashlytics: !__DEV__,  // Desactivar en desarrollo
    enablePerformance: true,
    debugMode: __DEV__,
    allowedLogLevels: __DEV__ 
      ? ['debug', 'info', 'warn', 'error']
      : ['warn', 'error'],
    sampleRate: __DEV__ ? 1.0 : 0.1  // Reducir la tasa de muestreo en producción
  });

  // Establecer identificador de usuario si está disponible
  if (userId) {
    monitoringService.setUserIdentifier(userId);
  }

  // Registrar información del dispositivo
  await monitoringService.log({
    level: 'info',
    message: 'App initialized',
    timestamp: Date.now(),
    metadata: {
      platform: Platform.OS,
      version: Platform.Version,
      deviceModel: await Device.modelName,
      deviceType: Device.DeviceType[await Device.getDeviceTypeAsync()],
      osVersion: Device.osVersion,
      appVersion: process.env.APP_VERSION || 'unknown'
    }
  });
};

export const monitoringConstants = {
  PERFORMANCE_METRICS: {
    APP_LAUNCH: 'app_launch',
    SCREEN_LOAD: 'screen_load',
    API_CALL: 'api_call',
    DB_OPERATION: 'db_operation',
    AUTH_OPERATION: 'auth_operation'
  },
  LOG_TAGS: {
    NAVIGATION: 'navigation',
    API: 'api',
    AUTH: 'auth',
    DATABASE: 'database',
    BUSINESS_LOGIC: 'business_logic',
    UI: 'ui'
  }
} as const; 