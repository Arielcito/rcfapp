import { Request, Response } from 'express';
import { MercadoPagoService } from '../services/mercadoPagoService';
import type { MercadoPagoConfigDTO, CreatePreferenceDTO } from '../types/mercadopago';

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

  async createPreference(req: Request, res: Response) {
    try {
      const data: CreatePreferenceDTO = req.body;
      const preference = await mercadoPagoService.createPreference(data);
      
      res.json({
        success: true,
        data: preference
      });
    } catch (error) {
      console.error('Error al crear preferencia:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear preferencia de pago'
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