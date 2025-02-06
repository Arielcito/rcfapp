import { Request, Response } from 'express';
import * as movimientoService from '../services/movimientoService';
import type { 
  MovimientoCajaCreationData, 
  MovimientoCajaUpdateData, 
  MovimientoCajaFiltros,
  TipoMovimiento,
  MetodoPago 
} from '../types/movimiento';

// Obtener todas las categorías activas
export const getCategorias = async (_req: Request, res: Response) => {
  try {
    const categorias = await movimientoService.getCategorias();
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
};

// Obtener movimientos con filtros
export const getMovimientos = async (req: Request, res: Response) => {
  try {
    const { predioId } = req.params;
    const filtros: MovimientoCajaFiltros = {
      fechaDesde: req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined,
      fechaHasta: req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined,
      categoriaId: req.query.categoriaId as string,
      tipo: req.query.tipo as TipoMovimiento,
      metodoPago: req.query.metodoPago as MetodoPago,
    };

    const movimientos = await movimientoService.getMovimientos(predioId, filtros);
    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener los movimientos' });
  }
};

// Crear nuevo movimiento
export const createMovimiento = async (req: Request, res: Response) => {
  try {
    const movimientoData: MovimientoCajaCreationData = req.body;
    const nuevoMovimiento = await movimientoService.createMovimiento(movimientoData);
    res.status(201).json(nuevoMovimiento);
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ error: 'Error al crear el movimiento' });
  }
};

// Actualizar movimiento existente
export const updateMovimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movimientoData: MovimientoCajaUpdateData = req.body;
    
    const movimientoActualizado = await movimientoService.updateMovimiento(id, movimientoData);
    
    if (!movimientoActualizado) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }
    
    res.json(movimientoActualizado);
  } catch (error) {
    console.error('Error al actualizar movimiento:', error);
    res.status(500).json({ error: 'Error al actualizar el movimiento' });
  }
};

// Eliminar movimiento
export const deleteMovimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await movimientoService.deleteMovimiento(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    res.status(500).json({ error: 'Error al eliminar el movimiento' });
  }
};

// Obtener resumen de movimientos
export const getResumenMovimientos = async (req: Request, res: Response) => {
  try {
    const { predioId } = req.params;
    const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined;
    const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined;

    const resumen = await movimientoService.getResumenMovimientos(predioId, fechaDesde, fechaHasta);
    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error al obtener el resumen de movimientos' });
  }
}; 