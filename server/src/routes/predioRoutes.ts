import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../types/user';
import {
  createPredio,
  getPredios,
  getPredioById,
  getPrediosByUsuarioId,
  updatePredio,
  deletePredio,
  getPredioByOwnerId
} from '../controllers/predioController';

const router = express.Router();

router.post('/', authenticateToken, createPredio);
router.get('/', getPredios);
router.get('/:id', authenticateToken, getPredioById);
router.get('/usuario/:id', authenticateToken, getPrediosByUsuarioId);
router.get('/owner/:id', authenticateToken, getPredioByOwnerId);
router.put('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), updatePredio);
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), deletePredio);

export default router;