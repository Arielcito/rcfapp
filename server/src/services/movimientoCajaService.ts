import { db } from '../db';
import { movimientosCaja } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { CreateMovimientoCajaDTO, UpdateMovimientoCajaDTO } from '../types/movimientoCaja';

export class MovimientoCajaService {
  async createMovimiento(data: CreateMovimientoCajaDTO) {
    try {
      const nuevoMovimiento = await db.insert(movimientosCaja).values({
        predioId: data.predioId,
        concepto: data.concepto,
        descripcion: data.descripcion,
        monto: data.monto.toString(),
        tipo: data.tipo,
        metodoPago: data.metodoPago,
      }).returning();

      return nuevoMovimiento[0];
    } catch (error) {
      throw new Error('Error al crear el movimiento de caja');
    }
  }

  async getMovimientoById(id: string) {
    try {
      const movimiento = await db.select()
        .from(movimientosCaja)
        .where(eq(movimientosCaja.id, id));
      
      return movimiento[0];
    } catch (error) {
      throw new Error('Error al obtener el movimiento de caja');
    }
  }

  async getMovimientosByPredio(predioId: string) {
    try {
      const movimientos = await db.select()
        .from(movimientosCaja)
        .where(eq(movimientosCaja.predioId, predioId));
      
      return movimientos;
    } catch (error) {
      throw new Error('Error al obtener los movimientos de caja');
    }
  }

  async updateMovimiento(id: string, data: UpdateMovimientoCajaDTO) {
    try {
      const movimientoActualizado = await db.update(movimientosCaja)
        .set({
          ...data,
          monto: String(data.monto),
        })
        .where(eq(movimientosCaja.id, id))
        .returning();

      return movimientoActualizado[0];
    } catch (error) {
      throw new Error('Error al actualizar el movimiento de caja');
    }
  }
} 