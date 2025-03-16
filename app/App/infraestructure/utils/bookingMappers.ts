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
    precioTotal: booking.precioTotal,
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