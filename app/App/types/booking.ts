export interface Place {
  name: string;
  description: string;
  imageUrl: string;
  telefono: string;
}

export interface BookingResponse {
  appointmentId: string;
  place: Place;
  appointmentDate: string;
  appointmentTime: string;
  estado: string;
  metodoPago?: string;
  duracion: number;
  precioTotal: number;
}

export interface Cancha {
  id: string;
  nombre: string;
  tipo: string | null;
  tipoSuperficie: string | null;
  imagenUrl?: string;
}

export interface Predio {
  id: string;
  nombre: string;
  telefono: string;
}

export interface Booking {
  id: string;
  fechaHora: string;
  estadoPago: string;
  duracion: number;
  precioTotal: string | number;
  metodoPago?: string;
  cancha?: Cancha;
  predio?: Predio;
  notasAdicionales?: string;
} 