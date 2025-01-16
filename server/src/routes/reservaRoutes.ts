import { Router } from 'express';
import { ReservaController } from '../controllers/reservaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const reservaController = new ReservaController();

// Rutas GET
router.get('/', authenticateToken, reservaController.getReservas);
router.get('/user/bookings', authenticateToken, reservaController.getUserBookings);
router.get('/owner/:id', authenticateToken, reservaController.getReservasByOwner);
router.get('/owner/:date/:ownerId', authenticateToken, reservaController.getReservasByDate);
router.get('/:id', authenticateToken, reservaController.getReservaById);

// Rutas POST
router.post('/', authenticateToken, reservaController.createReserva);
router.post('/check', authenticateToken, reservaController.checkReservaAvailability);
router.post('/available-times', authenticateToken, reservaController.getAvailableTimes);

// Rutas PUT
router.put('/:id', authenticateToken, reservaController.updateReserva);

export default router; 