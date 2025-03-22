import { Platform } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import perf from '@react-native-firebase/perf';
import analytics from '@react-native-firebase/analytics';
import type { ErrorReport, PerformanceMetric, LogEntry, MonitoringConfig } from './types';

class MonitoringService {
  private static instance: MonitoringService;
  private config: MonitoringConfig = {
    enableCrashlytics: true,
    enablePerformance: true,
    debugMode: __DEV__,
    allowedLogLevels: ['error', 'warn', 'info'],
    sampleRate: 1.0
  };

  private constructor() {
    this.initializeErrorHandler();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public setConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public setUserIdentifier(userId: string): void {
    if (this.config.enableCrashlytics) {
      crashlytics().setUserId(userId);
    }
    analytics().setUserId(userId);
    this.config.userIdentifier = userId;
  }

  private initializeErrorHandler(): void {
    if (this.config.enableCrashlytics) {
      ErrorUtils.setGlobalHandler(async (error: Error, isFatal?: boolean) => {
        await this.reportError({
          error,
          isFatal: !!isFatal,
          timestamp: Date.now(),
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version.toString(),
          }
        });
      });
    }
  }

  public async reportError(errorReport: ErrorReport): Promise<void> {
    if (!this.config.enableCrashlytics) return;

    try {
      crashlytics().recordError(errorReport.error);
      
      if (errorReport.userId) {
        crashlytics().setUserId(errorReport.userId);
      }

      crashlytics().setAttributes({
        isFatal: errorReport.isFatal.toString(),
        timestamp: errorReport.timestamp.toString(),
        platform: errorReport.deviceInfo.platform,
        version: errorReport.deviceInfo.version,
        ...errorReport.context
      });

      if (this.config.debugMode) {
        console.error('Error reportado a Crashlytics:', errorReport);
      }
    } catch (e) {
      console.error('Error al reportar a Crashlytics:', e);
    }
  }

  public async trackPerformance(metric: PerformanceMetric): Promise<void> {
    if (!this.config.enablePerformance) return;

    try {
      const trace = await perf().startTrace(metric.name);
      
      if (metric.attributes) {
        Object.entries(metric.attributes).forEach(([key, value]) => {
          trace.putAttribute(key, value.toString());
        });
      }

      trace.putMetric('duration', metric.duration);
      await trace.stop();

      if (this.config.debugMode) {
        console.log('Métrica de rendimiento registrada:', metric);
      }
    } catch (e) {
      console.error('Error al registrar métrica de rendimiento:', e);
    }
  }

  public async log(entry: LogEntry): Promise<void> {
    if (!this.config.allowedLogLevels.includes(entry.level)) return;

    try {
      if (entry.level === 'error') {
        await crashlytics().log(JSON.stringify(entry));
      }

      if (this.config.debugMode) {
        console[entry.level](entry.message, entry.metadata);
      }

      // Registrar en Analytics para análisis posterior
      await analytics().logEvent('app_log', {
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        tags: entry.tags,
        ...entry.metadata
      });
    } catch (e) {
      console.error('Error al registrar log:', e);
    }
  }

  public async startPerformanceMonitoring(name: string): Promise<() => Promise<void>> {
    if (!this.config.enablePerformance) return async () => {};

    const startTime = Date.now();
    const trace = await perf().startTrace(name);

    return async () => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      await this.trackPerformance({
        name,
        startTime,
        endTime,
        duration
      });

      await trace.stop();
    };
  }
}

export const monitoringService = MonitoringService.getInstance(); 