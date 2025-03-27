import express from 'express';
import { body } from 'express-validator';


const router = express.Router();

router.post('/client-logs',
  [
    body('logs').isArray(),
    body('component').isString(),
    body('timestamp').isString()
  ],
  async (req, res) => {
    try {
      const { logs, component, timestamp } = req.body;
      
      // Formatear los logs para mejor legibilidad
      console.log('\n=== CLIENT LOGS ===');
      console.log(`Component: ${component}`);
      console.log(`Timestamp: ${timestamp}`);
      console.log('Logs:');
      
      logs.forEach((log: any) => {
        const level = log.level.toUpperCase();
        const color = {
          ERROR: '\x1b[31m', // Red
          WARN: '\x1b[33m',  // Yellow
          INFO: '\x1b[36m',  // Cyan
          DEBUG: '\x1b[35m'  // Magenta
        }[level] || '\x1b[0m';
        
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