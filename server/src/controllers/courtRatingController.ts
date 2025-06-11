import type { Request, Response } from 'express';
import { CourtRatingService } from '../services/courtRatingService';
import type { CreateCourtRatingDTO } from '../types/courtRating';
import { 
  createCourtRatingSchema, 
  getCourtRatingByIdSchema, 
  getCourtRatingsByReservaSchema, 
  getCourtRatingsByCanchaSchema 
} from '../types/courtRating';
import { logger } from '../utils/logger';
import { HttpError } from '../utils/errors';

const courtRatingService = new CourtRatingService();

export class CourtRatingController {
  async createCourtRating(req: Request, res: Response) {
    try {
      logger.info('[CourtRatingController] Iniciando creación de calificación');
      
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuario no autorizado');
      }

      // Validar los datos con Zod
      const validatedData = createCourtRatingSchema.parse(req.body);
      
      const nuevaCalificacion = await courtRatingService.createCourtRating(userId, validatedData);
      
      logger.info('[CourtRatingController] Calificación creada exitosamente');
      res.status(201).json({
        success: true,
        data: nuevaCalificacion,
        message: 'Calificación creada exitosamente'
      });
    } catch (error) {
      logger.error('[CourtRatingController] Error al crear calificación:', error);
      
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      
      // Errores de validación de Zod
      if (error && typeof error === 'object' && 'issues' in error) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.issues
        });
      }
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear la calificación'
      });
    }
  }

  async getCourtRatingById(req: Request, res: Response) {
    try {
      const validatedParams = getCourtRatingByIdSchema.parse(req.params);
      const calificacion = await courtRatingService.getCourtRatingById(validatedParams.id);

      if (!calificacion) {
        return res.status(404).json({
          success: false,
          error: 'Calificación no encontrada'
        });
      }

      res.json({
        success: true,
        data: calificacion
      });
    } catch (error) {
      logger.error('[CourtRatingController] Error al obtener calificación:', error);
      
      // Errores de validación de Zod
      if (error && typeof error === 'object' && 'issues' in error) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido',
          details: error.issues
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener la calificación'
      });
    }
  }

  async getCourtRatingByReserva(req: Request, res: Response) {
    try {
      const validatedParams = getCourtRatingsByReservaSchema.parse(req.params);
      const calificacion = await courtRatingService.getCourtRatingsByReserva(validatedParams.reservaId);

      res.json({
        success: true,
        data: calificacion
      });
    } catch (error) {
      logger.error('[CourtRatingController] Error al obtener calificación por reserva:', error);
      
      if (error && typeof error === 'object' && 'issues' in error) {
        return res.status(400).json({
          success: false,
          error: 'ID de reserva inválido',
          details: error.issues
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener la calificación'
      });
    }
  }

  async getCourtRatingsByCancha(req: Request, res: Response) {
    try {
      const validatedParams = getCourtRatingsByCanchaSchema.parse(req.params);
      const calificaciones = await courtRatingService.getCourtRatingsByCancha(validatedParams.canchaId);

      res.json({
        success: true,
        data: calificaciones
      });
    } catch (error) {
      logger.error('[CourtRatingController] Error al obtener calificaciones por cancha:', error);
      
      if (error && typeof error === 'object' && 'issues' in error) {
        return res.status(400).json({
          success: false,
          error: 'ID de cancha inválido',
          details: error.issues
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener las calificaciones'
      });
    }
  }

  async getCourtRatingSummary(req: Request, res: Response) {
    try {
      const validatedParams = getCourtRatingsByCanchaSchema.parse(req.params);
      const resumen = await courtRatingService.getCourtRatingSummary(validatedParams.canchaId);

      res.json({
        success: true,
        data: resumen
      });
    } catch (error) {
      logger.error('[CourtRatingController] Error al obtener resumen de calificaciones:', error);
      
      if (error && typeof error === 'object' && 'issues' in error) {
        return res.status(400).json({
          success: false,
          error: 'ID de cancha inválido',
          details: error.issues
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener el resumen de calificaciones'
      });
    }
  }

  async getPendingRatings(req: Request, res: Response) {
    try {
      logger.info('[CourtRatingController] Obteniendo calificaciones pendientes');
      
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuario no autorizado');
      }

      const reservasPendientes = await courtRatingService.getPendingRatingsByUser(userId);
      
      res.json({
        success: true,
        data: reservasPendientes,
        message: 'Calificaciones pendientes obtenidas exitosamente'
      });
    } catch (error) {
      logger.error('[CourtRatingController] Error al obtener calificaciones pendientes:', error);
      
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener las calificaciones pendientes'
      });
    }
  }

  async getUserCourtRatingForReserva(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuario no autorizado');
      }

      const validatedParams = getCourtRatingsByReservaSchema.parse(req.params);
      const calificacion = await courtRatingService.getUserCourtRatingForReserva(
        userId, 
        validatedParams.reservaId
      );

      res.json({
        success: true,
        data: calificacion
      });
    } catch (error) {
      logger.error('[CourtRatingController] Error al obtener calificación del usuario:', error);
      
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }
      
      if (error && typeof error === 'object' && 'issues' in error) {
        return res.status(400).json({
          success: false,
          error: 'ID de reserva inválido',
          details: error.issues
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener la calificación del usuario'
      });
    }
  }
} 