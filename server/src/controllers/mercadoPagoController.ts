import { Request, Response } from 'express';
import { MercadoPagoService } from '../services/mercadoPagoService';
import type { MercadoPagoConfigDTO, CreatePreferenceDTO } from '../types/mercadopago';
import { encrypt } from '../utils/encryption';

const mercadoPagoService = new MercadoPagoService();

export class MercadoPagoController {
  async saveConfig(req: Request, res: Response) {
    console.log('[MercadoPagoController] Iniciando saveConfig');
    try {
      const data: MercadoPagoConfigDTO = req.body;
      console.log('[MercadoPagoController] Datos recibidos para configuración:', {
        data
      });
      
      const config = await mercadoPagoService.saveConfig(data);
      console.log('[MercadoPagoController] Configuración guardada exitosamente');
      
      res.status(201).json({
        success: true,
        data: {
          ...config,
          accessToken: '********', // Ocultar token por seguridad
        }
      });
    } catch (error) {
      console.error('[MercadoPagoController] Error al guardar configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error al guardar la configuración de Mercado Pago'
      });
    }
  }

  async saveEnvConfig(req: Request, res: Response) {
    console.log('[MercadoPagoController] Iniciando saveEnvConfig');
    try {
      // Get Mercado Pago keys from environment variables
      const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
      const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
      const predioId = req.params.predioId;

      console.log('[MercadoPagoController] Validando variables de entorno y predioId');
      if (!publicKey || !accessToken || !clientId || !clientSecret) {
        console.error('[MercadoPagoController] Faltan variables de entorno');
        return res.status(400).json({
          success: false,
          error: 'Faltan variables de entorno para Mercado Pago. Verifica tu archivo .env'
        });
      }

      if (!predioId) {
        console.error('[MercadoPagoController] Falta predioId');
        return res.status(400).json({
          success: false,
          error: 'Se requiere el ID del predio'
        });
      }

      // Create config data
      const configData: MercadoPagoConfigDTO = {
        predioId,
        publicKey,
        accessToken,
        clientId,
        clientSecret,
        isTestMode: process.env.NODE_ENV !== 'production'
      };

      console.log('[MercadoPagoController] Guardando configuración desde variables de entorno');
      const config = await mercadoPagoService.saveConfig(configData);
      console.log('[MercadoPagoController] Configuración guardada exitosamente');
      
      res.status(201).json({
        success: true,
        data: {
          predioId: config.predioId,
          publicKey: config.publicKey,
          clientId: config.clientId,
          isTestMode: config.isTestMode,
          accessToken: '********', // Ocultar token por seguridad
          clientSecret: '********' // Ocultar secret por seguridad
        }
      });
    } catch (error) {
      console.error('[MercadoPagoController] Error al guardar configuración desde variables de entorno:', error);
      res.status(500).json({
        success: false,
        error: 'Error al guardar la configuración de Mercado Pago'
      });
    }
  }

  async createPreference(req: Request, res: Response) {
    console.log('[MercadoPagoController] Iniciando createPreference');
    try {
      const data: CreatePreferenceDTO = req.body;
      console.log('[MercadoPagoController] Datos recibidos para crear preferencia:', {
        predioId: data.predioId,
        items: data.items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id
        })),
        external_reference: data.external_reference
      });
      
      console.log('[MercadoPagoController] Iniciando creación de preferencia...');
      const preference = await mercadoPagoService.createPreference(data);
      console.log('[MercadoPagoController] Preferencia creada exitosamente:', {
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point
      });
      
      res.json({
        success: true,
        data: preference
      });
    } catch (error: any) {
      console.error('[MercadoPagoController] Error al crear preferencia:', error);
      console.error('[MercadoPagoController] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.message === 'Configuración de Mercado Pago no encontrada para este predio' 
        ? 'Este predio no tiene configurado Mercado Pago. Por favor, contacte al administrador.'
        : 'Error al crear preferencia de pago';
        
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async getPaymentInfo(req: Request, res: Response) {
    console.log('[MercadoPagoController] Iniciando getPaymentInfo');
    try {
      const { paymentId, predioId } = req.params;
      console.log('[MercadoPagoController] Buscando información de pago:', { paymentId, predioId });
      
      const payment = await mercadoPagoService.getPaymentById(paymentId, predioId);
      console.log('[MercadoPagoController] Información de pago obtenida exitosamente');
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('[MercadoPagoController] Error al obtener pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener información del pago'
      });
    }
  }

  async getPublicKey(req: Request, res: Response) {
    console.log('[MercadoPagoController] Iniciando getPublicKey');
    try {
      const { predioId } = req.params;
      console.log('[MercadoPagoController] Buscando clave pública para predio:', predioId);
      
      const { publicKey } = await mercadoPagoService.getPublicKey(predioId);
      console.log('[MercadoPagoController] Clave pública obtenida exitosamente');
      
      res.json({
        success: true,
        data: { publicKey }
      });
    } catch (error) {
      console.error('[MercadoPagoController] Error al obtener clave pública:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener la clave pública'
      });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    console.log('[MercadoPagoController] Recibiendo webhook de Mercado Pago');
    try {
      const { action, data } = req.body;
      
      if (action !== 'payment.updated' && action !== 'payment.created') {
        console.log('[MercadoPagoController] Acción no manejada:', action);
        return res.status(200).json({ received: true });
      }

      const paymentId = data.id;
      const predioId = req.query.predio_id as string;

      if (!paymentId || !predioId) {
        console.error('[MercadoPagoController] Faltan datos requeridos:', { paymentId, predioId });
        return res.status(400).json({
          success: false,
          error: 'Faltan datos requeridos'
        });
      }

      console.log('[MercadoPagoController] Procesando notificación:', {
        action,
        paymentId,
        predioId
      });

      const paymentInfo = await mercadoPagoService.handleWebhook(paymentId, predioId);
      
      console.log('[MercadoPagoController] Webhook procesado exitosamente');
      res.status(200).json({
        success: true,
        data: paymentInfo
      });
    } catch (error) {
      console.error('[MercadoPagoController] Error al procesar webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Error al procesar la notificación de pago'
      });
    }
  }
} 