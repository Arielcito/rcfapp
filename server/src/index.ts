import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import predioRoutes from './routes/predioRoutes';
import canchaRoutes from './routes/canchaRoutes';
import reservaRoutes from './routes/reservaRoutes';
import pagoRoutes from './routes/pagoRoutes';
import movimientoCajaRoutes from './routes/movimientoCajaRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/predios', predioRoutes);
app.use('/api/canchas', canchaRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/movimientos-caja', movimientoCajaRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});