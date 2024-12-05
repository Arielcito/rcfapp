import type { Request, Response } from 'express';
import { ReservaService } from '../services/reservaService';
import type { CreateReservaDTO, UpdateReservaDTO } from '../types/reserva';
    

const reservaService = new ReservaService();

export class ReservaController {
  async createReserva(req: Request, res: Response) {
    try {
      const data: CreateReservaDTO = req.body;
      const nuevaReserva = await reservaService.createReserva(data);
      
      res.status(201).json({
        success: true,
        data: nuevaReserva
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al crear la reserva'
      });
    }
  }

  async getReservaById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reserva = await reservaService.getReservaById(id);

      if (!reserva) {
        return res.status(404).json({
          success: false,
          error: 'Reserva no encontrada'
        });
      }

      res.json({
        success: true,
        data: reserva
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener la reserva'
      });
    }
  }

  async updateReserva(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateReservaDTO = req.body;
      
      const reservaActualizada = await reservaService.updateReserva(id, data);

      res.json({
        success: true,
        data: reservaActualizada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al actualizar la reserva'
      });
    }
  }
} 