import type { Request, Response } from 'express';
import { PagoService } from '../services/pagoService';
import type { CreatePagoDTO, UpdatePagoDTO } from '../types/pago';

const pagoService = new PagoService();

export class PagoController {
  async createPago(req: Request, res: Response) {
    try {
      const data: CreatePagoDTO = {
        ...req.body,
        monto: req.body.monto.toString(), // Convertir a string para Drizzle
      };
      const nuevoPago = await pagoService.createPago(data);
      
      res.status(201).json({
        success: true,
        data: nuevoPago
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al crear el pago'
      });
    }
  }

  async getPagoById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pago = await pagoService.getPagoById(id);

      if (!pago) {
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: pago
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener el pago'
      });
    }
  }
  
  async updatePago(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdatePagoDTO = {
        ...req.body,
        monto: req.body.monto?.toString(), // Convertir a string si existe
      };
      
      const pagoActualizado = await pagoService.updatePago(id, data);

      res.json({
        success: true,
        data: pagoActualizado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al actualizar el pago'
      });
    }
  }
} 