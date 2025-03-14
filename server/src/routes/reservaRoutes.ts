import { Router } from 'express';
import { ReservaController } from '../controllers/reservaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const reservaController = new ReservaController();

// Rutas GET
router.get('/', reservaController.getReservas);
router.get('/user/bookings', reservaController.getUserBookings);
router.get('/owner/:id', reservaController.getReservasByOwner);
router.get('/owner/:date/:ownerId', reservaController.getReservasByDate);
router.get('/:id', reservaController.getReservaById);

// Rutas POST
router.post('/', reservaController.createReserva);
router.post('/check', reservaController.checkReservaAvailability);
router.post('/available-times', reservaController.getAvailableTimes);

// Rutas PUT
router.put('/:id', reservaController.updateReserva);

export default router; 