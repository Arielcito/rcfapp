import type { Request, Response } from 'express';
import { ReservaService } from '../services/reservaService';
import type { CreateReservaDTO, UpdateReservaDTO } from '../types/reserva';
import moment from 'moment';
    

const reservaService = new ReservaService();

export class ReservaController {
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
      // Mock data para pruebas
      const mockBookings = [
        {
          appointmentId: 1,
          place: {
            name: "Cancha El Gol",
            address: "Av. Siempreviva 123"
          },
          cancha: 1,
          appointmentDate: moment().format("YYYY-MM-DD"),
          appointmentTime: "19:00",
          estado: "reservado",
          metodoPago: "efectivo"
        },
        {
          appointmentId: 2,
          place: {
            name: "Cancha La Pelota",
            address: "Calle Falsa 123"
          },
          cancha: 2,
          appointmentDate: moment().add(1, 'days').format("YYYY-MM-DD"),
          appointmentTime: "20:00",
          estado: "pendiente",
          metodoPago: "tarjeta"
        },
        {
          appointmentId: 3,
          place: {
            name: "Cancha El Corner",
            address: "Av. del Futbol 456"
          },
          cancha: 1,
          appointmentDate: moment().subtract(1, 'days').format("YYYY-MM-DD"),
          appointmentTime: "18:00",
          estado: "cancelado",
          metodoPago: "efectivo"
        }
      ];

      res.json(mockBookings);
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
      res.status(500).json({ message: 'Error al obtener las reservas' });
    }
  }
} 