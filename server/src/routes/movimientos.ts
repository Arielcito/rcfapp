import express from 'express';
import * as movimientoController from '../controllers/movimientoController';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

// Rutas públicas
router.get('/categorias', movimientoController.getCategorias);

// Rutas protegidas
router.use(authMiddleware);

// Movimientos por predio
router.get('/predio/:predioId', movimientoController.getMovimientos);
router.post('/predio/:predioId', movimientoController.createMovimiento);

// Operaciones sobre movimientos específicos
router.put('/:id', movimientoController.updateMovimiento);
router.delete('/:id', movimientoController.deleteMovimiento);

// Resumen y reportes
router.get('/predio/:predioId/resumen', movimientoController.getResumenMovimientos);

export default router; 