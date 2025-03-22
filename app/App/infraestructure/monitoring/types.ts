export interface ErrorReport {
  error: Error;
  isFatal: boolean;
  userId?: string;
  timestamp: number;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
  context?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  attributes?: Record<string, any>;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MonitoringConfig {
  enableCrashlytics: boolean;
  enablePerformance: boolean;
  debugMode: boolean;
  allowedLogLevels: LogLevel[];
  sampleRate: number;
  userIdentifier?: string;
} 