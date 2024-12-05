import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../types/user';
import {
  createCancha,
  getCanchas,
  getCanchaById,
  getCanchasByPredioId,
  updateCancha,
  deleteCancha
} from '../controllers/canchaController';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), createCancha);
router.get('/', authenticateToken, getCanchas);
router.get('/:id', authenticateToken, getCanchaById);
router.get('/predio/:predioId', authenticateToken, getCanchasByPredioId);
router.put('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), updateCancha);
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), deleteCancha);

export default router;