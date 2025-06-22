import { Router } from 'express';
import { GoogleCalendarController } from '../controllers/googleCalendarController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new GoogleCalendarController();

// Ruta para generar URL de autorización
router.get('/auth-url', authenticateToken, (req, res) => controller.generateAuthUrl(req, res));

// Ruta para manejar el callback de OAuth
router.get('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      console.error('[GoogleCalendarRoutes] Falta código o estado en callback');
      return res.redirect('RFCApp://checkout/congrats?status=error');
    }

    // Decodificar el estado para obtener el userId
    const { userId } = JSON.parse(Buffer.from(state as string, 'base64').toString());
    
    if (!userId) {
      console.error('[GoogleCalendarRoutes] No se encontró userId en el estado');
      return res.redirect('RFCApp://checkout/congrats?status=error');
    }

    // Asignar el userId al request para que el controlador lo pueda usar
    (req as any).user = { id: userId };

    // Intercambiar el código por tokens
    await controller.handleCallback(req as any, res);
    
    // Redirigir de vuelta a la app usando el esquema existente
    res.redirect('RFCApp://checkout/congrats?status=success');
  } catch (error) {
    console.error('[GoogleCalendarRoutes] Error en callback:', error);
    res.redirect('RFCApp://checkout/congrats?status=error');
  }
});

// Ruta para desvincular Google Calendar
router.delete('/disconnect', authenticateToken, (req, res) => controller.disconnectCalendar(req, res));

// Ruta para obtener estado de conexión
router.get('/connection-status', authenticateToken, (req, res) => controller.getConnectionStatus(req, res));

export default router;