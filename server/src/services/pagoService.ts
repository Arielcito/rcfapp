import { db } from '../db';
import { pagos, reservas } from '../db/schema';
import { eq } from 'drizzle-orm';

export class PagoService {
  async createPago(data: CreatePagoDTO) {
    try {
      const nuevoPago = await db.transaction(async (tx) => {
        // Crear el pago
        const [pago] = await tx.insert(pagos).values({
          reservaId: data.reservaId,
          userId: data.userId,
          monto: data.monto,
          metodoPago: data.metodoPago,
          estadoPago: data.estadoPago,
          numeroTransaccion: data.numeroTransaccion,
          detallesAdicionales: data.detallesAdicionales,
        }).returning();

        // Actualizar la reserva con el ID del pago
        await tx.update(reservas)
          .set({ 
            pagoId: pago.id,
            estadoPago: data.estadoPago 
          })
          .where(eq(reservas.id, data.reservaId));

        return pago;
      });

      return nuevoPago;
    } catch (error) {
      throw new Error('Error al crear el pago');
    }
  }

  async getPagoById(id: string) {
    try {
      const pago = await db.select()
        .from(pagos)
        .where(eq(pagos.id, id));
      
      return pago[0];
    } catch (error) {
      throw new Error('Error al obtener el pago');
    }
  }

  async updatePago(id: string, data: UpdatePagoDTO) {
    try {
      const pagoActualizado = await db.update(pagos)
        .set(data)
        .where(eq(pagos.id, id))
        .returning();

      return pagoActualizado[0];
    } catch (error) {
      throw new Error('Error al actualizar el pago');
    }
  }
} 