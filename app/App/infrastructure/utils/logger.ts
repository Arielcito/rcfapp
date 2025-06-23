import axios from 'axios';
import Constants from 'expo-constants';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private readonly API_URL = 'https://rcfapp.com.ar/api';
  private readonly LOG_BATCH_SIZE = 10;
  private readonly LOG_BATCH_INTERVAL = 5000; // 5 segundos
  private batchTimeout: NodeJS.Timeout | null = null;
  private disabled: boolean = true; // Flag to disable logging

  private constructor() {
    // Iniciar el envío periódico de logs
    this.startBatchSending();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, component: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // En desarrollo, mostrar en consola
    if (__DEV__) {
      const color = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[35m'  // Magenta
      }[entry.level.toUpperCase()] || '\x1b[0m';
      
      console.log(`${color}[${entry.level.toUpperCase()}] [${entry.component}] ${entry.message}${entry.data ? '\n' + JSON.stringify(entry.data, null, 2) : ''}\x1b[0m`);
    }
  }

  private async sendLogsToServer(logs: LogEntry[], component: string) {
    try {
      await axios.post(`${this.API_URL}/logs/client-logs`, {
        logs,
        component,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending logs to server:', error);
      // Reintentar más tarde
      this.logs.unshift(...logs);
    }
  }

  private startBatchSending() {
    if (__DEV__) return; // No enviar logs en desarrollo

    const sendBatch = async () => {
      if (this.logs.length === 0) return;

      const batch = this.logs.splice(0, this.LOG_BATCH_SIZE);
      const component = batch[0].component; // Asumimos que todos los logs son del mismo componente

      await this.sendLogsToServer(batch, component);
    };

    this.batchTimeout = setInterval(sendBatch, this.LOG_BATCH_INTERVAL);
  }

  private stopBatchSending() {
    if (this.batchTimeout) {
      clearInterval(this.batchTimeout);
      this.batchTimeout = null;
    }
  }

  info(component: string, message: string, data?: any) {
    if (this.disabled) return;
    const entry = this.formatMessage('info', component, message, data);
    this.addLog(entry);
  }

  warn(component: string, message: string, data?: any) {
    if (this.disabled) return;
    const entry = this.formatMessage('warn', component, message, data);
    this.addLog(entry);
  }

  error(component: string, message: string, data?: any) {
    if (this.disabled) return;
    const entry = this.formatMessage('error', component, message, data);
    this.addLog(entry);
  }

  debug(component: string, message: string, data?: any) {
    if (this.disabled) return;
    const entry = this.formatMessage('debug', component, message, data);
    this.addLog(entry);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Método para exportar logs en formato JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Método para limpiar recursos
  cleanup() {
    this.stopBatchSending();
  }
}

export const logger = Logger.getInstance(); 