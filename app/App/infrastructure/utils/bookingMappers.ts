import moment from 'moment';
import type { Booking, BookingResponse } from '../../types/booking';

export const mapBookingResponse = (booking: Booking): BookingResponse => {
  const fechaHora = moment(booking.fechaHora);

  return {
    appointmentId: booking.id,
    appointmentDate: fechaHora.format('YYYY-MM-DD'),
    appointmentTime: fechaHora.format('HH:mm'),
    estado: booking.estadoPago.toLowerCase(),
    duracion: booking.duracion,
    precioTotal: Number(booking.precioTotal),
    place: {
      name: booking.cancha?.nombre || 'Sin nombre',
      description: booking.cancha ? 
        `${booking.cancha.tipo || 'Fútbol'} - ${booking.cancha.tipoSuperficie || 'No especificado'}` : 
        'Sin descripción',
      imageUrl: booking.cancha?.imagenUrl || 'https://example.com/placeholder.jpg',
      telefono: booking.predio?.telefono || 'No disponible'
    }
  };
};

export interface ReservaResponse {
  id: string;
  userId: string;
  fechaHora: string;
  duracion: number;
  precioTotal: string | number;
  estadoPago: string;
  metodoPago: string;
  notasAdicionales?: string;
  cancha?: {
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    predio?: {
      telefono: string;
    };
  };
  canchaId: string;
}

export const mapReservaToBooking = (reserva: ReservaResponse): BookingResponse => {
  const fecha = new Date(reserva.fechaHora);
  
  return {
    appointmentId: reserva.id,
    appointmentDate: fecha.toISOString().split('T')[0],
    appointmentTime: fecha.toTimeString().split(' ')[0],
    fechaHora: reserva.fechaHora,
    duracion: reserva.duracion,
    estado: reserva.estadoPago,
    estadoPago: reserva.estadoPago,
    metodoPago: reserva.metodoPago,
    precioTotal: typeof reserva.precioTotal === 'string' ? parseFloat(reserva.precioTotal) : reserva.precioTotal,
    userId: reserva.userId,
    canchaId: reserva.canchaId,
    place: {
      name: reserva.cancha?.nombre || 'Cancha',
      description: reserva.cancha?.descripcion || '',
      imageUrl: reserva.cancha?.imagenUrl || '',
      telefono: reserva.cancha?.predio?.telefono || '',
    },
    notasAdicionales: reserva.notasAdicionales,
  };
}; 