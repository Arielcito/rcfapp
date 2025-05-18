import moment from 'moment';
import type { BookingResponse } from '../../types/booking';

export const filterBookings = (bookings: BookingResponse[], showPastBookings: boolean = false): BookingResponse[] => {
  const now = moment();
  
  return bookings.filter(booking => {
    // Parse the date and time in UTC
    const bookingDateTime = moment(`${booking.appointmentDate} ${booking.appointmentTime}`, 'YYYY-MM-DD HH:mm');
    const isFuture = bookingDateTime.isAfter(now);
    
    console.log('Booking filter details:', {
      id: booking.appointmentId,
      date: booking.appointmentDate,
      time: booking.appointmentTime,
      estado: booking.estado,
      isFuture,
      bookingDateTime: bookingDateTime.format('YYYY-MM-DD HH:mm'),
      now: now.format('YYYY-MM-DD HH:mm')
    });
    
    // Si showPastBookings es true, mostrar todas las reservas (para el historial)
    if (showPastBookings) {
      return true;
    }
    
    // Para reservas activas y pendientes, solo mostrar las futuras
    if (booking.estado === 'pendiente' || booking.estado === 'pagado') {
      return isFuture;
    }
    
    // Para reservas canceladas, mostrar todas
    return booking.estado === 'cancelado';
  });
}; 