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
  getCurrentUser,
  checkEmail
} from '../controllers/userController';
import { getPredioById, getPrediosByUsuarioId } from '../controllers/predioController';

const router = express.Router();

// Rutas públicas de autenticación
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/check-email', checkEmail);

// Ruta protegida para obtener usuario actual
router.get('/me', authenticateToken, getCurrentUser);

// Rutas protegidas de administración
router.post('/', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), createUser);
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.OWNER]), deleteUser);
router.get('/:id/predio', authenticateToken, getPrediosByUsuarioId);
router.post('/auth/logout', async (req, res) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

export default router;