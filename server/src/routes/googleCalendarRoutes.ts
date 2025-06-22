import { Router } from 'express';
import { GoogleCalendarController } from '../controllers/googleCalendarController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new GoogleCalendarController();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Iniciar proceso de vinculación
router.get('/auth-url', (req, res) => controller.generateAuthUrl(req, res));

// Callback después de autorización
router.post('/callback', (req, res) => controller.handleCallback(req, res));

// Desvinculear cuenta
router.delete('/disconnect', (req, res) => controller.disconnectCalendar(req, res));

// Verificar estado de vinculación
router.get('/status', (req, res) => controller.getConnectionStatus(req, res));

export { router as googleCalendarRoutes };