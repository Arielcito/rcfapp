import { Router } from 'express';
import { MovimientoCajaController } from '../controllers/movimientoCajaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const movimientoCajaController = new MovimientoCajaController();

router.use(authenticateToken);

router.post('/', movimientoCajaController.createMovimiento);
router.get('/:id', movimientoCajaController.getMovimientoById);
router.get('/predio/:predioId', movimientoCajaController.getMovimientosByPredio);
router.put('/:id', movimientoCajaController.updateMovimiento);

export default router; 