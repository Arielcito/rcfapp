import type { Request, Response, NextFunction } from 'express';
import * as canchaService from '../services/canchaService';
import type { CanchaCreationData, CanchaUpdateData } from '../types/cancha';

export const createCancha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cancha = await canchaService.createCancha(req.body as CanchaCreationData);
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