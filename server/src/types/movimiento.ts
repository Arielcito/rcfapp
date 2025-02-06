export type TipoMovimiento = 'INGRESO' | 'EGRESO';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO' | 'MERCADO_PAGO' | 'OTRO';

export interface CategoriaMovimiento {
  id: string;
  nombre: string;
  tipo: TipoMovimiento;
  descripcion?: string;
  activo: boolean;
}

export interface MovimientoCaja {
  id: string;
  predioId: string;
  categoriaId: string;
  concepto: string;
  descripcion?: string;
  monto: number;
  tipo: TipoMovimiento;
  metodoPago: MetodoPago;
  fechaMovimiento: Date;
  comprobante?: string;
}

export interface MovimientoCajaCreationData extends Omit<MovimientoCaja, 'id' | 'fechaMovimiento'> {
  fechaMovimiento?: Date;
}

export interface MovimientoCajaUpdateData extends Partial<MovimientoCajaCreationData> {}

export interface MovimientoCajaFiltros {
  fechaDesde?: Date;
  fechaHasta?: Date;
  categoriaId?: string;
  tipo?: TipoMovimiento;
  metodoPago?: MetodoPago;
}

export interface ResumenMovimientos {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  movimientosPorCategoria: {
    categoriaId: string;
    categoriaNombre: string;
    total: number;
  }[];
} 