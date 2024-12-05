export interface CreatePagoDTO {
  reservaId: string;
  userId: string;
  monto: string; // Cambiado a string para compatibilidad con Drizzle
  metodoPago: string;
  estadoPago: string;
  numeroTransaccion?: string;
  detallesAdicionales?: string;
}

export interface UpdatePagoDTO {
  monto?: string; // Cambiado a string para compatibilidad con Drizzle
  metodoPago?: string;
  estadoPago?: string;
  numeroTransaccion?: string;
  detallesAdicionales?: string;
} 