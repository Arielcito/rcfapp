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
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser()); // Para manejar cookies
app.use(express.json());

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Cookies:', req.cookies);
  
  // Interceptar la respuesta para loggear
  const oldJson = res.json;
  res.json = function(body) {
    console.log('Response:', body);
    return oldJson.call(this, body);
  };
  
  next();
});

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