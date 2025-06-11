import type { Request, Response, NextFunction } from 'express';
import * as canchaService from '../services/canchaService';
import type { CanchaCreationData, CanchaUpdateData } from '../types/cancha';
import { z } from 'zod';

const canchaSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  descripcion: z.string().optional(),
  predioId: z.string().min(1, 'PredioId es requerido'),
  deporteId: z.string().min(1, 'DeporteId es requerido'),
  precio: z.number().positive('Precio debe ser positivo'),
});

export const createCancha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = canchaSchema.parse(req.body);
    const cancha = await canchaService.createCancha(validatedData);
    res.status(201).json(cancha);
  } catch (error) {
    next(error);
  }
};

export const getCanchas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const canchas = await canchaService.getCanchas();
    res.json(canchas);
  } catch (error) {
    next(error);
  }
};

export const getCanchaById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cancha = await canchaService.getCanchaById(req.params.id);
    if (!cancha) {
      res.status(404).json({ message: 'Cancha not found' });
      return;
    }
    console.log('Cancha encontrada:', cancha);
    res.json(cancha);
  } catch (error) {
    next(error);
  }
};

export const getCanchasByPredioId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const canchas = await canchaService.getCanchasByPredioId(req.params.predioId);
    res.json(canchas);
  } catch (error) {
    next(error);
  }
};

export const getAvailableCanchasByPredioId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { predioId } = req.params;
    const { fecha, hora } = req.query;
    
    if (!fecha || !hora) {
      res.status(400).json({ 
        success: false, 
        error: 'Fecha y hora son requeridas' 
      });
      return;
    }

    console.log('🔍 [canchaController] Obteniendo canchas disponibles:', { predioId, fecha, hora });
    
    const availableCanchas = await canchaService.getAvailableCanchasByPredioId(
      predioId, 
      fecha as string, 
      hora as string
    );
    
    console.log('📦 [canchaController] Canchas disponibles encontradas:', availableCanchas.length);
    res.json(availableCanchas);
  } catch (error) {
    console.error('❌ [canchaController] Error al obtener canchas disponibles:', error);
    next(error);
  }
};

export const updateCancha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cancha = await canchaService.updateCancha(req.params.id, req.body as CanchaUpdateData);
    if (!cancha) {
      res.status(404).json({ message: 'Cancha not found' });
      return;
    }
    res.json(cancha);
  } catch (error) {
    next(error);
  }
};

export const deleteCancha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await canchaService.deleteCancha(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};