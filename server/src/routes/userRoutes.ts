import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../types/user';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  register,
  logout,
  getCurrentUser
} from '../controllers/userController';

const router = express.Router();

// Rutas públicas de autenticación
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

// Ruta protegida para obtener usuario actual
router.get('/me', authenticateToken, getCurrentUser);

// Rutas protegidas de administración
router.post('/', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), createUser);
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), deleteUser);

export default router;