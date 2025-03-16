import type { Request, Response } from 'express';
import { ReservaService } from '../services/reservaService';
import type { CreateReservaDTO, UpdateReservaDTO } from '../types/reserva';
import type { User } from '../types/user';
import moment from 'moment';

const reservaService = new ReservaService();

export class ReservaController {
  async getReservas(req: Request, res: Response) {
    try {
      const reservas = await reservaService.getReservas();
      console.log('Reservas obtenidas:', reservas);
      res.json({
        success: true,
        data: reservas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener las reservas'
      });
    }
  }

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

  async checkReservaAvailability(req: Request, res: Response) {
    try {
      const { canchaId, fechaHora, duracion } = req.body;
      
      if (!canchaId || !fechaHora || !duracion) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos requeridos'
        });
      }

      const disponible = await reservaService.checkReservaAvailability(
        canchaId,
        new Date(fechaHora),
        duracion
      );

      return res.status(200).json({
        success: true,
        data: { disponible }
      });
    } catch (error) {
      console.error('[ReservaController] Error al verificar disponibilidad:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar la disponibilidad de la reserva'
      });
    }
  }

  async getAvailableTimes(req: Request, res: Response) {
    try {
      const { fecha } = req.body;
      
      // Aquí deberías implementar la lógica para obtener los horarios disponibles
      // Por ejemplo, puedes agregar este método en ReservaService
      const availableTimes = await reservaService.getAvailableTimes(fecha);

      res.json({
        success: true,
        data: {
          reservedTimes: availableTimes
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener horarios disponibles'
      });
    }
  }

  async getReservasByDate(req: Request, res: Response) {
    try {
      const { date,ownerId } = req.params;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autorizado'
        });
      }

      const reservas = await reservaService.getReservasByDate(date, ownerId);

      res.json({
        success: true,
        data: reservas
      });
    } catch (error) {
      console.error('Error en getReservasByDate:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener las reservas'
      });
    }
  }

  async getUserBookings(req: Request, res: Response) {
    try {
      console.log('[ReservaController] Iniciando getUserBookings');
      console.log('[ReservaController] Usuario autenticado:', req.user);

      const userId = req.user?.id;
      if (!userId) {
        console.error('[ReservaController] No se encontró ID de usuario en el request');
        return res.status(401).json({
          success: false,
          error: 'Usuario no autorizado'
        });
      }

      console.log('[ReservaController] Buscando reservas para usuario:', userId);
      const reservas = await reservaService.getUserBookings(userId);
      console.log('[ReservaController] Reservas encontradas:', reservas.length);

      const formattedReservas = reservas.map(reserva => ({
        appointmentId: reserva.id,
        place: {
          name: reserva.cancha?.nombre || 'Cancha sin nombre',
          description: reserva.cancha ? `${reserva.cancha.tipo || 'Fútbol'} - ${reserva.cancha.tipoSuperficie || 'No especificado'}` : 'Sin descripción',
          imageUrl: "https://example.com/placeholder.jpg",
          telefono: reserva.predio?.telefono || 'No disponible'
        },
        appointmentDate: new Date(reserva.fechaHora).toISOString().split('T')[0],
        appointmentTime: new Date(reserva.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        estado: reserva.estadoPago?.toLowerCase() || 'pendiente',
        metodoPago: reserva.metodoPago
      }));

      console.log('[ReservaController] Respuesta formateada:', {
        totalReservas: formattedReservas.length,
        primeraReserva: formattedReservas[0] || null
      });

      res.json(formattedReservas);
    } catch (error) {
      console.error('[ReservaController] Error completo:', error);
      console.error('[ReservaController] Stack:', error instanceof Error ? error.stack : 'No stack available');
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener las reservas' 
      });
    }
  }

  async getReservasByOwner(req: Request, res: Response) {
    try {
      const { id: ownerId } = req.params;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          error: 'ID del dueño es requerido'
        });
      }

      const reservas = await reservaService.getReservasByOwner(ownerId);

      const formattedReservas = reservas.map(reserva => ({
        appointmentId: reserva.id,
        place: {
          name: reserva.cancha.nombre || 'Cancha sin nombre',
          description: `${reserva.cancha.tipo || 'Fútbol'} - ${reserva.cancha.tipoSuperficie || 'No especificado'}`,
          imageUrl: "https://example.com/placeholder.jpg",
          telefono: reserva.predio.telefono || 'No disponible'
        },
        appointmentDate: new Date(reserva.fechaHora).toISOString().split('T')[0],
        appointmentTime: new Date(reserva.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        estado: reserva.estadoPago?.toLowerCase() || 'pendiente',
        metodoPago: reserva.metodoPago
      }));

      res.json({
        success: true,
        data: formattedReservas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener las reservas del dueño'
      });
    }
  }
} 