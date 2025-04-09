import { Request, Response } from 'express';
import { MercadoPagoService } from '../services/mercadoPagoService';
import type { MercadoPagoConfigDTO, CreatePreferenceDTO } from '../types/mercadopago';
import { encrypt } from '../utils/encryption';

const mercadoPagoService = new MercadoPagoService();

export class MercadoPagoController {
  async saveConfig(req: Request, res: Response) {
    try {
      const data: MercadoPagoConfigDTO = req.body;
      const config = await mercadoPagoService.saveConfig(data);
      
      res.status(201).json({
        success: true,
        data: {
          ...config,
          accessToken: '********', // Ocultar token por seguridad
        }
      });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error al guardar la configuración de Mercado Pago'
      });
    }
  }

  async saveEnvConfig(req: Request, res: Response) {
    try {
      // Get Mercado Pago keys from environment variables
      const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
      const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
      const predioId = req.params.predioId;

      if (!publicKey || !accessToken || !clientId || !clientSecret) {
        return res.status(400).json({
          success: false,
          error: 'Faltan variables de entorno para Mercado Pago. Verifica tu archivo .env'
        });
      }

      if (!predioId) {
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

      // Save config
      const config = await mercadoPagoService.saveConfig(configData);
      
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
      console.error('Error al guardar configuración desde variables de entorno:', error);
      res.status(500).json({
        success: false,
        error: 'Error al guardar la configuración de Mercado Pago'
      });
    }
  }

  async createPreference(req: Request, res: Response) {
    try {
      const data: CreatePreferenceDTO = req.body;
      console.log('Recibida solicitud para crear preferencia de Mercado Pago');
      console.log('Datos recibidos:', {
        predioId: data.predioId,
        items: data.items,
        external_reference: data.external_reference
      });
      
      const preference = await mercadoPagoService.createPreference(data);
      console.log('Preferencia creada exitosamente:', preference);
      
      res.json({
        success: true,
        data: preference
      });
    } catch (error: any) {
      console.error('Error al crear preferencia:', error);
      console.error('Detalles del error:', {
        message: error.message,
        stack: error.stack
      });
      
      // Enviar un mensaje de error más específico al cliente
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
    try {
      const { paymentId, predioId } = req.params;
      const payment = await mercadoPagoService.getPaymentById(paymentId, predioId);
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error al obtener pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener información del pago'
      });
    }
  }

  async getPublicKey(req: Request, res: Response) {
    try {
      const { predioId } = req.params;
      const { publicKey } = await mercadoPagoService.getPublicKey(predioId);
      
      res.json({
        success: true,
        data: { publicKey }
      });
    } catch (error) {
      console.error('Error al obtener clave pública:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener la clave pública'
      });
    }
  }
} 