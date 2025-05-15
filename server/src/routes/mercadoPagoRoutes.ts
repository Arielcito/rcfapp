import { Router } from 'express';
import { MercadoPagoController } from '../controllers/mercadoPagoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const mercadoPagoController = new MercadoPagoController();

// Configuración de Mercado Pago
router.post('/config', mercadoPagoController.saveConfig);
router.post('/config/env/:predioId', mercadoPagoController.saveEnvConfig);
router.get('/public-key/:predioId', mercadoPagoController.getPublicKey);

// Rutas para pagos
router.post('/create-preference', mercadoPagoController.createPreference);
router.get('/payment/:paymentId/:predioId', mercadoPagoController.getPaymentInfo);

// Webhook para notificaciones de Mercado Pago
router.post('/webhook', mercadoPagoController.handleWebhook);

export default router; 