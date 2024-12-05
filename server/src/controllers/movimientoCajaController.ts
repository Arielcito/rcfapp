import type { Request, Response } from 'express';
import { MovimientoCajaService } from '../services/movimientoCajaService';
import type { CreateMovimientoCajaDTO, UpdateMovimientoCajaDTO } from '../types/movimientoCaja';

const movimientoCajaService = new MovimientoCajaService();

export class MovimientoCajaController {
  async createMovimiento(req: Request, res: Response) {
    try {
      const data: CreateMovimientoCajaDTO = req.body;
      const nuevoMovimiento = await movimientoCajaService.createMovimiento(data);
      
      res.status(201).json({
        success: true,
        data: nuevoMovimiento
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al crear el movimiento de caja'
      });
    }
  }

  async getMovimientoById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movimiento = await movimientoCajaService.getMovimientoById(id);

      if (!movimiento) {
        return res.status(404).json({
          success: false,
          error: 'Movimiento no encontrado'
        });
      }

      res.json({
        success: true,
        data: movimiento
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener el movimiento'
      });
    }
  }

  async getMovimientosByPredio(req: Request, res: Response) {
    try {
      const { predioId } = req.params;
      const movimientos = await movimientoCajaService.getMovimientosByPredio(predioId);

      res.json({
        success: true,
        data: movimientos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener los movimientos'
      });
    }
  }

  async updateMovimiento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateMovimientoCajaDTO = req.body;
      
      const movimientoActualizado = await movimientoCajaService.updateMovimiento(id, data);

      res.json({
        success: true,
        data: movimientoActualizado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al actualizar el movimiento'
      });
    }
  }
} 