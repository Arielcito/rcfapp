import express, { Request, Response } from 'express';
import { body } from 'express-validator';

interface LogEntry {
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  timestamp: string;
  message: string;
  data?: unknown;
}

interface ClientLogsRequest {
  logs: LogEntry[];
  component: string;
  timestamp: string;
}

const router = express.Router();

router.post('/client-logs',
  [
    body('logs').isArray(),
    body('component').isString(),
    body('timestamp').isString()
  ],
  async (req: Request<{}, {}, ClientLogsRequest>, res: Response) => {
    try {
      const { logs, component, timestamp } = req.body;
      
      // Formatear los logs para mejor legibilidad
      console.log('\n=== CLIENT LOGS ===');
      console.log(`Component: ${component}`);
      console.log(`Timestamp: ${timestamp}`);
      console.log('Logs:');
      
      logs.forEach((log) => {
        const level = log.level.toUpperCase();
        const colorMap: Record<string, string> = {
          ERROR: '\x1b[31m', // Red
          WARN: '\x1b[33m',  // Yellow
          INFO: '\x1b[36m',  // Cyan
          DEBUG: '\x1b[35m'  // Magenta
        };
        const color = colorMap[level] || '\x1b[0m';
        
        console.log(`${color}[${level}] ${log.timestamp} - ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}\x1b[0m`);
      });
      
      console.log('==================\n');
      
      res.status(200).json({ message: 'Logs received successfully' });
    } catch (error) {
      console.error('Error processing client logs:', error);
      res.status(500).json({ message: 'Error processing logs' });
    }
  }
);

export default router; 