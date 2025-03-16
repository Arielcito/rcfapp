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