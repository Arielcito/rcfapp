import { db } from '../db';
import { categoriaMovimiento, movimientosCaja } from '../db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import type {
  CategoriaMovimiento,
  MovimientoCaja,
  MovimientoCajaCreationData,
  MovimientoCajaUpdateData,
  MovimientoCajaFiltros,
  ResumenMovimientos,
  MetodoPago
} from '../types/movimiento';

// Categorías
export const getCategorias = async (): Promise<CategoriaMovimiento[]> => {
  const result = await db.select()
    .from(categoriaMovimiento)
    .where(eq(categoriaMovimiento.activo, true));

  return result.map(cat => ({
    id: cat.id,
    nombre: cat.nombre,
    tipo: cat.tipo as 'INGRESO' | 'EGRESO',
    descripcion: cat.descripcion || undefined,
    activo: cat.activo || false
  }));
};

interface DBMovimiento {
  id: string;
  predioId: string | null;
  categoriaId: string | null;
  concepto: string;
  descripcion: string | null;
  monto: string;
  tipo: string;
  metodoPago: string;
  fechaMovimiento: Date | null;
  comprobante: string | null;
}

const mapMovimientoFromDB = (mov: DBMovimiento): MovimientoCaja | null => {
  if (!mov.id || !mov.predioId || !mov.categoriaId || !mov.fechaMovimiento) {
    return null;
  }

  return {
    id: mov.id,
    predioId: mov.predioId,
    categoriaId: mov.categoriaId,
    concepto: mov.concepto,
    descripcion: mov.descripcion || undefined,
    monto: Number(mov.monto),
    tipo: mov.tipo as 'INGRESO' | 'EGRESO',
    metodoPago: mov.metodoPago as MetodoPago,
    fechaMovimiento: mov.fechaMovimiento,
    comprobante: mov.comprobante || undefined
  };
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

  const result = await db.select()
    .from(movimientosCaja)
    .where(and(...conditions))
    .orderBy(movimientosCaja.fechaMovimiento);

  return result.map(mov => {
    const mapped = mapMovimientoFromDB(mov);
    if (!mapped) {
      throw new Error(`Movimiento inválido encontrado: ${mov.id}`);
    }
    return mapped;
  });
};

export const createMovimiento = async (
  movimientoData: MovimientoCajaCreationData
): Promise<MovimientoCaja> => {
  const [result] = await db.insert(movimientosCaja)
    .values({
      ...movimientoData,
      monto: String(movimientoData.monto)
    })
    .returning();

  const mapped = mapMovimientoFromDB(result);
  if (!mapped) {
    throw new Error('Error al crear el movimiento: datos inválidos');
  }
  return mapped;
};

export const updateMovimiento = async (
  id: string,
  movimientoData: MovimientoCajaUpdateData
): Promise<MovimientoCaja | null> => {
  const updateData = {
    ...movimientoData,
    monto: movimientoData.monto ? String(movimientoData.monto) : undefined
  };

  const [result] = await db.update(movimientosCaja)
    .set(updateData)
    .where(eq(movimientosCaja.id, id))
    .returning();

  if (!result) return null;
  return mapMovimientoFromDB(result);
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
  const movimientos = await db.select({
    id: movimientosCaja.id,
    monto: movimientosCaja.monto,
    tipo: movimientosCaja.tipo,
    categoriaId: movimientosCaja.categoriaId,
    categoriaNombre: categoriaMovimiento.nombre
  })
  .from(movimientosCaja)
  .leftJoin(categoriaMovimiento, eq(movimientosCaja.categoriaId, categoriaMovimiento.id))
  .where(and(
    eq(movimientosCaja.predioId, predioId),
    fechaDesde ? gte(movimientosCaja.fechaMovimiento, fechaDesde) : undefined,
    fechaHasta ? lte(movimientosCaja.fechaMovimiento, fechaHasta) : undefined
  ));

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

    if (mov.categoriaId) {
      const categoriaActual = categoriasMap.get(mov.categoriaId) || { 
        nombre: mov.categoriaNombre || 'Sin categoría', 
        total: 0 
      };
      categoriaActual.total += Number(mov.monto);
      categoriasMap.set(mov.categoriaId, categoriaActual);
    }
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