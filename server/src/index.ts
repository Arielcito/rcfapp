import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import predioRoutes from './routes/predioRoutes';
import canchaRoutes from './routes/canchaRoutes';
import reservaRoutes from './routes/reservaRoutes';
import pagoRoutes from './routes/pagoRoutes';
import movimientosRoutes from './routes/movimientos';
import mercadoPagoRoutes from './routes/mercadoPagoRoutes';
import logRoutes from './routes/logRoutes';
import ownerRegistrationRoutes from './routes/ownerRegistrationRoutes';
import courtRatingRoutes from './routes/courtRatingRoutes';
import { errorHandler } from './middleware/errorHandler';
import deporteRoutes from './routes/deporteRoutes';
import googleCalendarRoutes from './routes/googleCalendarRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const BASE_PATH = process.env.BASE_PATH || '/api';

// Request logger middleware
app.use((req, res, next) => {
  next();
});

// Configuración de CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002', 'https://rcfapp.com.ar'];
app.use(cors({
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

app.use(cookieParser());
app.use(express.json());

// Routes with detailed logging
app.use(`${BASE_PATH}/users`, userRoutes);

app.use(`${BASE_PATH}/predios`, predioRoutes);

app.use(`${BASE_PATH}/canchas`, canchaRoutes);

app.use(`${BASE_PATH}/reservas`, reservaRoutes);

app.use(`${BASE_PATH}/pagos`, pagoRoutes);

// Register routes that don't depend on predio context
app.use(`${BASE_PATH}/movimientos`, movimientosRoutes);

app.use(`${BASE_PATH}/mercadopago`, mercadoPagoRoutes);

app.use(`${BASE_PATH}/logs`, logRoutes);

app.use(`${BASE_PATH}/owner-registration`, ownerRegistrationRoutes);

app.use(`${BASE_PATH}/court-ratings`, courtRatingRoutes);

app.use(`${BASE_PATH}/deportes`, deporteRoutes);

app.use(`${BASE_PATH}/google-calendar`, googleCalendarRoutes);

// Health check endpoint
app.get(`${BASE_PATH}/health`, (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling con logging
app.use((err: Error & { status?: number }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    status: err.status
  });
  
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
});

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log(`No route found for ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS origin:', process.env.CLIENT_URL || 'http://localhost:3000');
  console.log('Base path:', BASE_PATH);
});