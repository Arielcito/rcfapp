import { Router } from 'express';
import { ReservaController } from '../controllers/reservaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const reservaController = new ReservaController();

router.use(authenticateToken); // Protegemos todas las rutas con autenticación

router.get('/user/bookings', reservaController.getUserBookings);
router.post('/', reservaController.createReserva);
router.post('/check', reservaController.checkReservaAvailability);
router.post('/available-times', reservaController.getAvailableTimes);
router.get('/owner/:date/:ownerId', reservaController.getReservasByDate);
router.get('/:id', reservaController.getReservaById);
router.put('/:id', reservaController.updateReserva);

export default router; 