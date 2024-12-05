export interface CreateReservaDTO {
  canchaId: string;
  userId: string;
  fechaHora: string | Date;
  duracion: number;
  precioTotal?: number;
  metodoPago?: string;
  notasAdicionales?: string;
}

export interface UpdateReservaDTO {
  fechaHora?: Date;
  duracion?: number;
  precioTotal?: number;
  estadoPago?: string;
  metodoPago?: string;
  notasAdicionales?: string;
  pagoId?: string;
} 