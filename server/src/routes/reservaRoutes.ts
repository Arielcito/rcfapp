import { Router } from 'express';
import { ReservaController } from '../controllers/reservaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const reservaController = new ReservaController();

router.use(authenticateToken); // Protegemos todas las rutas con autenticación

router.post('/', reservaController.createReserva);
router.post('/check', reservaController.checkReservaAvailability);
router.get('/:id', reservaController.getReservaById);
router.put('/:id', reservaController.updateReserva);

export default router; 