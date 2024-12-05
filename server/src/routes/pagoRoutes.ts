import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PagoController } from '../controllers/pagoController';

const router = Router();
const pagoController = new PagoController();

router.use(authenticateToken);

router.post('/', pagoController.createPago);
router.get('/:id', pagoController.getPagoById);
router.put('/:id', pagoController.updatePago);

export default router; 