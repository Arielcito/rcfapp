import type { Request, Response, NextFunction } from 'express';
import * as deporteService from '../services/deporteService';

export const getDeportes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deportes = await deporteService.getDeportes();
    res.json(deportes);
  } catch (error) {
    next(error);
  }
};

export const getDeporteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deporte = await deporteService.getDeporteById(req.params.id);
    if (!deporte) {
      res.status(404).json({ message: 'Deporte not found' });
      return;
    }
    res.json(deporte);
  } catch (error) {
    next(error);
  }
}; 