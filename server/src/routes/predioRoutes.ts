import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../types/user';
import {
  createPredio,
  getPredios,
  getPredioById,
  getPrediosByUsuarioId,
  updatePredio,
  deletePredio
} from '../controllers/predioController';

const router = express.Router();

router.post('/', authenticateToken, createPredio);
router.get('/', getPredios);
router.get('/:id', authenticateToken, getPredioById);
router.get('/usuario/:usuarioId', authenticateToken, getPrediosByUsuarioId);
router.put('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), updatePredio);
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), deletePredio);

export default router;