import moment from 'moment';
import type { BookingResponse } from '../../types/booking';

export const filterBookings = (bookings: BookingResponse[]): BookingResponse[] => {
  const now = moment();
  console.log('Current time:', now.format('YYYY-MM-DD HH:mm'));
  
  return bookings.filter(booking => {
    const bookingDateTime = moment(`${booking.appointmentDate} ${booking.appointmentTime}`, 'YYYY-MM-DD HH:mm');
    const isFuture = bookingDateTime.isAfter(now);
    
    console.log('Booking:', {
      id: booking.appointmentId,
      date: booking.appointmentDate,
      time: booking.appointmentTime,
      estado: booking.estado,
      isFuture,
      bookingDateTime: bookingDateTime.format('YYYY-MM-DD HH:mm')
    });
    
    // Para reservas activas y pendientes, solo mostrar las futuras
    if (booking.estado === 'pendiente' || booking.estado === 'pagado') {
      return isFuture;
    }
    
    // Para reservas canceladas, mostrar todas
    return booking.estado === 'cancelado';
  });
}; 