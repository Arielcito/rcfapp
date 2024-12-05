import { Router } from 'express';
import { PagoController } from '../controllers/pagoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const pagoController = new PagoController();

router.use(authenticateToken);

router.post('/', pagoController.createPago);
router.get('/:id', pagoController.getPagoById);
router.put('/:id', pagoController.updatePago);

export default router; 