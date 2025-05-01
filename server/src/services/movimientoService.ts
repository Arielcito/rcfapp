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
  private validateUUID(uuid: string | null | undefined, fieldName: string, allowNull: boolean = false) {
    if (allowNull && (uuid === null || uuid === undefined || uuid === '')) {
      return;
    }
    
    if (!uuid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
      throw new ValidationError(`${fieldName} inválido`);
    }
  }

  private logError(operation: string, error: any, context?: any) {
    console.error(`[MovimientoService] Error in ${operation}:`, {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  private logOperation(operation: string, data?: any) {
    console.log(`[MovimientoService] ${operation}`, {
      data,
      timestamp: new Date().toISOString()
    });
  }

  async getCategorias(): Promise<CategoriaMovimiento[]> {
    try {
      this.logOperation('getCategorias');
      const result = await db.select()
        .from(categoriaMovimiento)
        .where(eq(categoriaMovimiento.activo, true));

      this.logOperation('getCategorias success', { count: result.length });
      return result.map(cat => ({
        id: cat.id,
        nombre: cat.nombre,
        tipo: cat.tipo as TipoMovimiento,
        descripcion: cat.descripcion || undefined,
        activo: cat.activo || false
      }));
    } catch (error) {
      this.logError('getCategorias', error);
      throw new DatabaseError('Error al obtener las categorías');
    }
  }

  async getMovimientos(
    predioId: string,
    filtros?: MovimientoCajaFiltros
  ): Promise<MovimientoCaja[]> {
    try {
      this.logOperation('getMovimientos', { predioId, filtros });
      this.validateUUID(predioId, 'predioId');
      if (filtros?.categoriaId) {
        this.validateUUID(filtros.categoriaId, 'categoriaId', true);
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

      this.logOperation('getMovimientos success', { count: result.length });
      return result.map(this.mapMovimientoFromDB);
    } catch (error) {
      this.logError('getMovimientos', error, { predioId, filtros });
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Error al obtener los movimientos');
    }
  }

  async createMovimiento(data: MovimientoCajaCreationData): Promise<MovimientoCaja> {
    try {
      this.logOperation('createMovimiento', { predioId: data.predioId });
      this.validateUUID(data.predioId, 'predioId');
      this.validateUUID(data.categoriaId, 'categoriaId', true);

      const [result] = await db.insert(movimientosCaja)
        .values({
          ...data,
          monto: String(data.monto),
          categoriaId: data.categoriaId || null
        })
        .returning();

      this.logOperation('createMovimiento success', { id: result.id });
      return this.mapMovimientoFromDB(result);
    } catch (error) {
      this.logError('createMovimiento', error, { predioId: data.predioId });
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Error al crear el movimiento');
    }
  }

  async updateMovimiento(
    id: string, 
    data: MovimientoCajaUpdateData
  ): Promise<MovimientoCaja> {
    try {
      this.logOperation('updateMovimiento', { id, data });
      this.validateUUID(id, 'id');
      if (data.predioId) this.validateUUID(data.predioId, 'predioId');
      if (data.categoriaId) this.validateUUID(data.categoriaId, 'categoriaId', true);

      const [result] = await db.update(movimientosCaja)
        .set({
          ...data,
          monto: data.monto ? String(data.monto) : undefined,
          categoriaId: data.categoriaId || null
        })
        .where(eq(movimientosCaja.id, id))
        .returning();

      if (!result) {
        throw new NotFoundError(`Movimiento con id ${id} no encontrado`);
      }

      this.logOperation('updateMovimiento success', { id });
      return this.mapMovimientoFromDB(result);
    } catch (error) {
      this.logError('updateMovimiento', error, { id, data });
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Error al actualizar el movimiento');
    }
  }

  async deleteMovimiento(id: string): Promise<void> {
    try {
      this.logOperation('deleteMovimiento', { id });
      this.validateUUID(id, 'id');
      
      const result = await db.delete(movimientosCaja)
        .where(eq(movimientosCaja.id, id))
        .returning();

      if (!result.length) {
        throw new NotFoundError(`Movimiento con id ${id} no encontrado`);
      }

      this.logOperation('deleteMovimiento success', { id });
    } catch (error) {
      this.logError('deleteMovimiento', error, { id });
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
      this.logOperation('getResumenMovimientos', { predioId, fechaDesde, fechaHasta });
      this.validateUUID(predioId, 'predioId');

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

      this.logOperation('getResumenMovimientos success', { count: movimientos.length });
      return this.calculateResumen(movimientos);
    } catch (error) {
      this.logError('getResumenMovimientos', error, { predioId, fechaDesde, fechaHasta });
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
    if (!mov.id || !mov.predioId) {
      throw new ValidationError('Datos del movimiento inválidos');
    }

    return {
      id: mov.id,
      predioId: mov.predioId,
      categoriaId: mov.categoriaId || null,
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