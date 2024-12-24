import { db } from '../db';
import { reservas, pagos, canchas, predios } from '../db/schema';
import { eq, sql, and, lt, gt } from 'drizzle-orm';
import type { CreateReservaDTO, UpdateReservaDTO } from '../types/reserva';

export class ReservaService {
  async createReserva(data: CreateReservaDTO) {
    try {
      const nuevaReserva = await db.insert(reservas).values({
        canchaId: data.canchaId,
        userId: data.userId,
        fechaHora: new Date(data.fechaHora),
        duracion: data.duracion,
        precioTotal: data.precioTotal?.toString(),
        estadoPago: 'PENDIENTE',
        metodoPago: data.metodoPago,
        notasAdicionales: data.notasAdicionales,
      }).returning();

      return nuevaReserva[0];
    } catch (error) {
      throw new Error('Error al crear la reserva');
    }
  }

  async getReservaById(id: string) {
    try {
      const reserva = await db.select()
        .from(reservas)
        .where(eq(reservas.id, id))
        .leftJoin(pagos, eq(reservas.pagoId, pagos.id));
      
      return reserva[0];
    } catch (error) {
      throw new Error('Error al obtener la reserva');
    }
  }

  async updateReserva(id: string, data: UpdateReservaDTO) {
    try {
      const updateData = {
        ...data,
        precioTotal: data.precioTotal?.toString(),
      };

      const reservaActualizada = await db.update(reservas)
        .set(updateData)
        .where(eq(reservas.id, id))
        .returning();

      return reservaActualizada[0];
    } catch (error) {
      throw new Error('Error al actualizar la reserva');
    }
  }

  async checkReservaAvailability(canchaId: string, fechaHora: Date, duracion: number) {
    try {
      const fechaInicio = new Date(fechaHora);
      const fechaFin = new Date(fechaHora);
      fechaFin.setMinutes(fechaFin.getMinutes() + duracion);

      const reservasExistentes = await db
        .select()
        .from(reservas)
        .where(
          and(
            eq(reservas.canchaId, canchaId),
            lt(reservas.fechaHora, fechaFin),
            gt(sql`DATE_ADD(${reservas.fechaHora}, INTERVAL ${reservas.duracion} MINUTE)`, fechaInicio)
          )
        );

      return reservasExistentes.length === 0;
    } catch (error) {
      throw new Error('Error al verificar la disponibilidad de la reserva');
    }
  }

  async getAvailableTimes(fecha: string) {
    try {
      // Obtener todas las reservas para la fecha especificada
      const reservasDelDia = await db
        .select()
        .from(reservas)
        .where(sql`DATE(fechaHora) = DATE(${fecha})`);
      console.log(reservasDelDia);
      // Extraer los horarios ocupados
      const horariosOcupados = reservasDelDia.map(reserva => {
        const hora = new Date(reserva.fechaHora).getHours();
        return `${hora.toString().padStart(2, '0')}:00`;
      });

      return horariosOcupados;
    } catch (error) {
      throw new Error('Error al obtener horarios disponibles');
    }
  }

  async getReservasByDate(date: string, ownerId: string) {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const reservasDelDia = await db
        .select()
        .from(reservas)
        .where(
          and(
            gt(reservas.fechaHora, startDate),
            lt(reservas.fechaHora, endDate),
            // Filtrar primero por predio del owner y luego por canchas de ese predio
            sql`EXISTS (
              SELECT 1 FROM ${predios} 
              JOIN ${canchas} ON ${canchas.predioId} = ${predios.id}
              WHERE ${canchas.id} = ${reservas.canchaId} 
              AND ${predios.usuarioId} = ${ownerId}
            )`
          )
        )
        .orderBy(reservas.fechaHora);

      return reservasDelDia;
    } catch (error) {
      console.error('Error al obtener reservas por fecha:', error);
      throw new Error('Error al obtener las reservas del día');
    }
  }
} 