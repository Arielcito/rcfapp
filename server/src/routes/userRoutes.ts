import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../types/user';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), createUser);
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), deleteUser);

export default router;