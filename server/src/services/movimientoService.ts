import { db } from '../db';
import { categoriaMovimiento, movimientosCaja } from '../db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import type {
  CategoriaMovimiento,
  MovimientoCaja,
  MovimientoCajaCreationData,
  MovimientoCajaUpdateData,
  MovimientoCajaFiltros,
  ResumenMovimientos
} from '../types/movimiento';

// Categorías
export const getCategorias = async (): Promise<CategoriaMovimiento[]> => {
  return await db.select()
    .from(categoriaMovimiento)
    .where(eq(categoriaMovimiento.activo, true));
};

// Movimientos
export const getMovimientos = async (
  predioId: string,
  filtros?: MovimientoCajaFiltros
): Promise<MovimientoCaja[]> => {
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

  return await db.select()
    .from(movimientosCaja)
    .where(and(...conditions))
    .orderBy(movimientosCaja.fechaMovimiento);
};

export const createMovimiento = async (
  movimientoData: MovimientoCajaCreationData
): Promise<MovimientoCaja> => {
  const [movimiento] = await db.insert(movimientosCaja)
    .values(movimientoData)
    .returning() as MovimientoCaja[];

  return movimiento;
};

export const updateMovimiento = async (
  id: string,
  movimientoData: MovimientoCajaUpdateData
): Promise<MovimientoCaja | null> => {
  const [movimiento] = await db.update(movimientosCaja)
    .set(movimientoData)
    .where(eq(movimientosCaja.id, id))
    .returning() as MovimientoCaja[];

  return movimiento || null;
};

export const deleteMovimiento = async (id: string): Promise<void> => {
  await db.delete(movimientosCaja)
    .where(eq(movimientosCaja.id, id));
};

export const getResumenMovimientos = async (
  predioId: string,
  fechaDesde?: Date,
  fechaHasta?: Date
): Promise<ResumenMovimientos> => {
  const movimientos = await getMovimientos(predioId, { fechaDesde, fechaHasta });

  const resumen: ResumenMovimientos = {
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
    movimientosPorCategoria: []
  };

  const categoriasMap = new Map<string, { nombre: string; total: number }>();

  for (const mov of movimientos) {
    if (mov.tipo === 'INGRESO') {
      resumen.totalIngresos += Number(mov.monto);
    } else {
      resumen.totalEgresos += Number(mov.monto);
    }

    // Acumular por categoría
    const categoriaActual = categoriasMap.get(mov.categoriaId) || { 
      nombre: '', 
      total: 0 
    };
    categoriaActual.total += Number(mov.monto);
    categoriasMap.set(mov.categoriaId, categoriaActual);
  }

  resumen.balance = resumen.totalIngresos - resumen.totalEgresos;
  resumen.movimientosPorCategoria = Array.from(categoriasMap.entries()).map(
    ([categoriaId, { nombre, total }]) => ({
      categoriaId,
      categoriaNombre: nombre,
      total
    })
  );

  return resumen;
}; 