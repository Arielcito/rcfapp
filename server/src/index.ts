import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import predioRoutes from './routes/predioRoutes';
import canchaRoutes from './routes/canchaRoutes';
import reservaRoutes from './routes/reservaRoutes';
import pagoRoutes from './routes/pagoRoutes';
import movimientoCajaRoutes from './routes/movimientoCajaRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3003', 'https://rcfapp.com.ar'];
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
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser()); // Para manejar cookies
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/predios', predioRoutes);
app.use('/api/canchas', canchaRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/movimientos-caja', movimientoCajaRoutes);

// Error handling con logging
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    status: err.status
  });
  
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS origin:', process.env.CLIENT_URL || 'http://localhost:3000');
});