import { db } from '../db';
import { reservas, pagos } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { CreateReservaDTO, UpdateReservaDTO } from '../types/reserva';


export class ReservaService {
  async createReserva(data: CreateReservaDTO) {
    try {
      const nuevaReserva = await db.insert(reservas).values({
        canchaId: data.canchaId,
        userId: data.userId,
        fechaHora: new Date(data.fechaHora),
        duracion: data.duracion,
        precioTotal: data.precioTotal,
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
      const reservaActualizada = await db.update(reservas)
        .set(data)
        .where(eq(reservas.id, id))
        .returning();

      return reservaActualizada[0];
    } catch (error) {
      throw new Error('Error al actualizar la reserva');
    }
  }
} 