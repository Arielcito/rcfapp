import { Router } from 'express';
import { MercadoPagoController } from '../controllers/mercadoPagoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const mercadoPagoController = new MercadoPagoController();

// Rutas protegidas que requieren autenticación y ser dueño
router.use(authenticateToken);

// Configuración de Mercado Pago
router.post('/config', mercadoPagoController.saveConfig);
router.get('/public-key/:predioId', mercadoPagoController.getPublicKey);

// Rutas para pagos
router.post('/create-preference', mercadoPagoController.createPreference);
router.get('/payment/:paymentId/:predioId', mercadoPagoController.getPaymentInfo);

export default router; 