import { monitoringService } from './MonitoringService';

export const withPerformanceTracking = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const stopTrace = await monitoringService.startPerformanceMonitoring(name);
  try {
    const result = await fn();
    await stopTrace();
    return result;
  } catch (error) {
    await stopTrace();
    throw error;
  }
};

export const withErrorBoundary = async <T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    await monitoringService.reportError({
      error: error instanceof Error ? error : new Error(String(error)),
      isFatal: false,
      timestamp: Date.now(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version.toString(),
      },
      context
    });
    throw error;
  }
};

export const logDebug = (message: string, metadata?: Record<string, any>) => {
  monitoringService.log({
    level: 'debug',
    message,
    timestamp: Date.now(),
    metadata
  });
};

export const logInfo = (message: string, metadata?: Record<string, any>) => {
  monitoringService.log({
    level: 'info',
    message,
    timestamp: Date.now(),
    metadata
  });
};

export const logWarn = (message: string, metadata?: Record<string, any>) => {
  monitoringService.log({
    level: 'warn',
    message,
    timestamp: Date.now(),
    metadata
  });
};

export const logError = (message: string, metadata?: Record<string, any>) => {
  monitoringService.log({
    level: 'error',
    message,
    timestamp: Date.now(),
    metadata
  });
}; 