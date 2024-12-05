import { Request, Response, NextFunction } from 'express';
import * as predioService from '../services/predioService';
import { PredioCreationData, PredioUpdateData } from '../types/predio';

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
    const predios = await predioService.getPrediosByUsuarioId(req.params.usuarioId);
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