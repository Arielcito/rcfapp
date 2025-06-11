import type { Request, Response, NextFunction } from 'express';
import * as predioService from '../services/predioService';
import type { PredioCreationData, PredioUpdateData } from '../types/predio';

export const createPredio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const predio = await predioService.createPredio(req.body as PredioCreationData);
    res.status(201).json(predio);
  } catch (error) {
    next(error);
  }
};

export const getPredios = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const predios = await predioService.getPredios();
    res.json(predios);
  } catch (error) {
    next(error);
  }
};

export const getPrediosWithAvailableCourts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fecha, hora, deporteId } = req.query;
    
    if (!fecha || !hora) {
      res.status(400).json({ 
        success: false, 
        error: 'Fecha y hora son requeridas' 
      });
      return;
    }

    console.log('🔍 [predioController] Obteniendo predios con canchas disponibles:', { fecha, hora, deporteId });
    
    const prediosWithAvailableCourts = await predioService.getPrediosWithAvailableCourts(
      fecha as string, 
      hora as string, 
      deporteId as string | undefined
    );
    
    console.log('📦 [predioController] Predios encontrados:', prediosWithAvailableCourts.length);
    res.json(prediosWithAvailableCourts);
  } catch (error) {
    console.error('❌ [predioController] Error al obtener predios con canchas disponibles:', error);
    next(error);
  }
};

export const getPredioById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const predio = await predioService.getPredioById(req.params.id);
    if (!predio) {
      res.status(404).json({ message: 'Predio not found' });
      return;
    }
    res.json(predio);
  } catch (error) {
    next(error);
  }
};

export const getPrediosByUsuarioId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ message: 'ID de usuario no proporcionado' });
      return;
    }

    const predios = await predioService.getPrediosByUsuarioId(id);
    
    if (!predios || predios.length === 0) {
      res.status(404).json({ message: 'No se encontraron predios para este usuario' });
      return;
    }

    res.json(predios);
  } catch (error) {
    next(error);
  }
};

export const updatePredio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const predio = await predioService.updatePredio(req.params.id, req.body as PredioUpdateData);
    if (!predio) {
      res.status(404).json({ message: 'Predio not found' });
      return;
    }
    res.json(predio);
  } catch (error) {
    next(error);
  }
};

export const deletePredio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await predioService.deletePredio(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getPredioByOwnerId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: 'ID de dueño no proporcionado' });
      return;
    }

    const predio = await predioService.getPredioByOwnerId(id);
    
    if (!predio) {
      res.status(404).json({ message: 'No se encontró predio para este dueño' });
      return;
    }

    res.json(predio);
  } catch (error) {
    next(error);
  }
};