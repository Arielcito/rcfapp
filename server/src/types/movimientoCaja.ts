export interface CreateMovimientoCajaDTO {
  predioId: string;
  concepto: string;
  descripcion?: string;
  monto: number;
  tipo: 'INGRESO' | 'EGRESO';
  metodoPago: string;
}

export interface UpdateMovimientoCajaDTO {
  concepto?: string;
  descripcion?: string;
  monto?: number;
  tipo?: 'INGRESO' | 'EGRESO';
  metodoPago?: string;
} 