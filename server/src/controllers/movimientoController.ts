import { Request, Response } from 'express';
import { MovimientoService } from '../services/movimientoService';
import { HttpError } from '../utils/errors';
import type { 
  MovimientoCajaCreationData, 
  MovimientoCajaUpdateData, 
  MovimientoCajaFiltros,
  TipoMovimiento,
  MetodoPago 
} from '../types/movimiento';

const movimientoService = new MovimientoService();

// Obtener todas las categorías activas
export const getCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await movimientoService.getCategorias();
    res.json(categorias);
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

// Obtener movimientos con filtros
export const getMovimientos = async (req: Request, res: Response) => {
  try {
    const { predioId } = req.params;
    const { fechaDesde, fechaHasta, categoriaId, tipo, metodoPago } = req.query;

    const filtros = {
      fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
      categoriaId: categoriaId as string | undefined,
      tipo: tipo as 'INGRESO' | 'EGRESO' | undefined,
      metodoPago: metodoPago as MetodoPago | undefined
    };

    const movimientos = await movimientoService.getMovimientos(predioId, filtros);
    res.json(movimientos);
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

// Crear nuevo movimiento
export const createMovimiento = async (req: Request, res: Response) => {
  try {
    const { predioId } = req.params;
    const movimientoData = {
      ...req.body,
      predioId
    };

    const movimiento = await movimientoService.createMovimiento(movimientoData);
    res.status(201).json(movimiento);
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

// Actualizar movimiento existente
export const updateMovimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movimientoData = req.body;

    const movimiento = await movimientoService.updateMovimiento(id, movimientoData);
    res.json(movimiento);
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

// Eliminar movimiento
export const deleteMovimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await movimientoService.deleteMovimiento(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

// Obtener resumen de movimientos
export const getResumenMovimientos = async (req: Request, res: Response) => {
  try {
    const { predioId } = req.params;
    const { fechaDesde, fechaHasta } = req.query;

    const resumen = await movimientoService.getResumenMovimientos(
      predioId,
      fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta ? new Date(fechaHasta as string) : undefined
    );

    res.json(resumen);
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}; 