import { db } from '../db';
import { categoriaMovimiento, movimientosCaja } from '../db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { 
  CategoriaMovimiento, 
  MovimientoCaja,
  MovimientoCajaCreationData,
  MovimientoCajaUpdateData,
  MovimientoCajaFiltros,
  ResumenMovimientos,
  TipoMovimiento,
  MetodoPago
} from '../types/movimiento';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

export class MovimientoService {
  private validateMonto(monto: number) {
    if (isNaN(monto) || monto <= 0) {
      throw new ValidationError('El monto debe ser un número positivo');
    }
  }

  private validateFechas(fechaDesde?: Date, fechaHasta?: Date) {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      throw new ValidationError('La fecha desde no puede ser mayor a la fecha hasta');
    }
  }

  private validateTipoMovimiento(tipo: string): tipo is TipoMovimiento {
    return tipo === 'INGRESO' || tipo === 'EGRESO';
  }

  private validateMetodoPago(metodo: string): metodo is MetodoPago {
    return ['EFECTIVO', 'TRANSFERENCIA', 'DEBITO', 'CREDITO', 'MERCADO_PAGO', 'OTRO'].includes(metodo);
  }

  async getCategorias(): Promise<CategoriaMovimiento[]> {
    try {
      const result = await db.select()
        .from(categoriaMovimiento)
        .where(eq(categoriaMovimiento.activo, true));

      return result.map(cat => ({
        id: cat.id,
        nombre: cat.nombre,
        tipo: cat.tipo as TipoMovimiento,
        descripcion: cat.descripcion || undefined,
        activo: cat.activo || false
      }));
    } catch (error) {
      throw new DatabaseError('Error al obtener las categorías');
    }
  }

  async getMovimientos(
    predioId: string,
    filtros?: MovimientoCajaFiltros
  ): Promise<MovimientoCaja[]> {
    try {
      if (filtros) {
        this.validateFechas(filtros.fechaDesde, filtros.fechaHasta);
      }

      const conditions = [eq(movimientosCaja.predioId, predioId)];

      if (filtros?.fechaDesde) {
        conditions.push(gte(movimientosCaja.fechaMovimiento, filtros.fechaDesde));
      }
      if (filtros?.fechaHasta) {
        conditions.push(lte(movimientosCaja.fechaMovimiento, filtros.fechaHasta));
      }
      if (filtros?.categoriaId) {
        conditions.push(eq(movimientosCaja.categoriaId, filtros.categoriaId));
      }
      if (filtros?.tipo) {
        conditions.push(eq(movimientosCaja.tipo, filtros.tipo));
      }
      if (filtros?.metodoPago) {
        conditions.push(eq(movimientosCaja.metodoPago, filtros.metodoPago));
      }

      const result = await db.select()
        .from(movimientosCaja)
        .where(and(...conditions))
        .orderBy(movimientosCaja.fechaMovimiento);

      return result.map(this.mapMovimientoFromDB);
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Error al obtener los movimientos');
    }
  }

  async createMovimiento(data: MovimientoCajaCreationData): Promise<MovimientoCaja> {
    try {
      const monto = typeof data.monto === 'string' ? Number(data.monto) : data.monto;
      this.validateMonto(monto);
      if (!this.validateTipoMovimiento(data.tipo)) {
        throw new ValidationError('Tipo de movimiento inválido');
      }
      if (!this.validateMetodoPago(data.metodoPago)) {
        throw new ValidationError('Método de pago inválido');
      }

      const [result] = await db.insert(movimientosCaja)
        .values({
          ...data,
          monto: String(monto),
          fechaMovimiento: data.fechaMovimiento || new Date()
        })
        .returning();

      return this.mapMovimientoFromDB(result);
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Error al crear el movimiento');
    }
  }

  async updateMovimiento(
    id: string, 
    data: MovimientoCajaUpdateData
  ): Promise<MovimientoCaja> {
    try {
      if (data.monto) {
        this.validateMonto(data.monto);
      }
      if (data.tipo && !this.validateTipoMovimiento(data.tipo)) {
        throw new ValidationError('Tipo de movimiento inválido');
      }
      if (data.metodoPago && !this.validateMetodoPago(data.metodoPago)) {
        throw new ValidationError('Método de pago inválido');
      }

      const [result] = await db.update(movimientosCaja)
        .set({
          ...data,
          monto: data.monto ? String(data.monto) : undefined
        })
        .where(eq(movimientosCaja.id, id))
        .returning();

      if (!result) {
        throw new NotFoundError(`Movimiento con id ${id} no encontrado`);
      }

      return this.mapMovimientoFromDB(result);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Error al actualizar el movimiento');
    }
  }

  async deleteMovimiento(id: string): Promise<void> {
    try {
      const result = await db.delete(movimientosCaja)
        .where(eq(movimientosCaja.id, id))
        .returning();

      if (!result.length) {
        throw new NotFoundError(`Movimiento con id ${id} no encontrado`);
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Error al eliminar el movimiento');
    }
  }

  async getResumenMovimientos(
    predioId: string,
    fechaDesde?: Date,
    fechaHasta?: Date
  ): Promise<ResumenMovimientos> {
    try {
      this.validateFechas(fechaDesde, fechaHasta);

      const movimientos = await db.select({
        id: movimientosCaja.id,
        monto: movimientosCaja.monto,
        tipo: movimientosCaja.tipo,
        categoriaId: movimientosCaja.categoriaId,
        categoriaNombre: categoriaMovimiento.nombre
      })
      .from(movimientosCaja)
      .leftJoin(
        categoriaMovimiento, 
        eq(movimientosCaja.categoriaId, categoriaMovimiento.id)
      )
      .where(
        and(
          eq(movimientosCaja.predioId, predioId),
          fechaDesde ? gte(movimientosCaja.fechaMovimiento, fechaDesde) : undefined,
          fechaHasta ? lte(movimientosCaja.fechaMovimiento, fechaHasta) : undefined
        )
      );

      return this.calculateResumen(movimientos);
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Error al obtener el resumen de movimientos');
    }
  }

  private calculateResumen(movimientos: any[]): ResumenMovimientos {
    const resumen: ResumenMovimientos = {
      totalIngresos: 0,
      totalEgresos: 0,
      balance: 0,
      movimientosPorCategoria: []
    };

    const categoriasMap = new Map<string, { nombre: string; total: number }>();

    for (const mov of movimientos) {
      const monto = Number(mov.monto);
      
      if (mov.tipo === 'INGRESO') {
        resumen.totalIngresos += monto;
      } else {
        resumen.totalEgresos += monto;
      }

      if (mov.categoriaId) {
        const categoriaActual = categoriasMap.get(mov.categoriaId) || {
          nombre: mov.categoriaNombre || 'Sin categoría',
          total: 0
        };
        categoriaActual.total += monto;
        categoriasMap.set(mov.categoriaId, categoriaActual);
      }
    }

    resumen.balance = resumen.totalIngresos - resumen.totalEgresos;
    resumen.movimientosPorCategoria = Array.from(categoriasMap.entries())
      .map(([categoriaId, { nombre, total }]) => ({
        categoriaId,
        categoriaNombre: nombre,
        total
      }));

    return resumen;
  }

  private mapMovimientoFromDB(mov: any): MovimientoCaja {
    if (!mov.id || !mov.predioId || !mov.categoriaId) {
      throw new ValidationError('Datos del movimiento inválidos');
    }

    return {
      id: mov.id,
      predioId: mov.predioId,
      categoriaId: mov.categoriaId,
      concepto: mov.concepto,
      descripcion: mov.descripcion || undefined,
      monto: Number(mov.monto),
      tipo: mov.tipo as TipoMovimiento,
      metodoPago: mov.metodoPago as MetodoPago,
      fechaMovimiento: mov.fechaMovimiento,
      comprobante: mov.comprobante || undefined
    };
  }
} 