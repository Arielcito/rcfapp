import { Router } from 'express';
import { ReservaController } from '../controllers/reservaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const reservaController = new ReservaController();

router.use(authenticateToken);

router.use((req, res, next) => {
  console.log(`[Reserva Route] ${req.method} ${req.originalUrl}`);
  console.log('[Reserva Route] Request Body:', req.body);
  console.log('[Reserva Route] Request Params:', req.params);
  console.log('[Reserva Route] Request Query:', req.query);
  next();
});

router.get('/user/bookings', reservaController.getUserBookings);
router.get('/owner/:ownerId', reservaController.getReservasByOwner);
router.post('/', reservaController.createReserva);
router.post('/check', reservaController.checkReservaAvailability);
router.post('/available-times', reservaController.getAvailableTimes);
router.get('/owner/:date/:ownerId', reservaController.getReservasByDate);
router.get('/:id', reservaController.getReservaById);
router.put('/:id', reservaController.updateReserva);

export default router; 