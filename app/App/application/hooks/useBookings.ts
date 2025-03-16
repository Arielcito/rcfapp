import { useState, useEffect, useCallback } from 'react';
import { reservaApi } from '../../infraestructure/api/reserva.api';
import { useCurrentUser } from '../context/CurrentUserContext';
import moment from 'moment';

interface Booking {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  estado: string;
  duracion: number;
  precioTotal: string;
  metodoPago?: string;
  place?: {
    name: string;
    description: string;
    imageUrl: string;
    telefono: string;
  };
}

interface BookingsState {
  active: Booking[];
  past: Booking[];
  cancelled: Booking[];
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingsState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, isLoading: isLoadingUser } = useCurrentUser();

  const mapReservaToBooking = useCallback((reserva: any): Booking => {
    const fechaHora = moment(reserva.fechaHora);
    return {
      appointmentId: reserva.id,
      appointmentDate: fechaHora.format('YYYY-MM-DD'),
      appointmentTime: fechaHora.format('HH:mm'),
      estado: reserva.estadoPago.toLowerCase(),
      duracion: reserva.duracion,
      precioTotal: reserva.precioTotal,
      metodoPago: reserva.metodoPago,
      place: {
        name: 'Cancha',
        description: reserva.notasAdicionales || '',
        imageUrl: 'https://example.com/placeholder.jpg',
        telefono: ''
      }
    };
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!currentUser?.id || isLoadingUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await reservaApi.obtenerReservasUsuarioFiltradas(currentUser.id);
      const reservas = response || [];
      const mappedBookings = reservas.map(mapReservaToBooking);
      
      setBookings({
        active: mappedBookings.filter((booking: Booking) => 
          booking.estado === 'pagado' || booking.estado === 'pendiente'
        ),
        past: mappedBookings.filter((booking: Booking) => 
          booking.estado === 'pendiente'
        ),
        cancelled: mappedBookings.filter((booking: Booking) => 
          booking.estado === 'cancelado'
        )
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener reservas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, isLoadingUser, mapReservaToBooking]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    error,
    isLoading: isLoading || isLoadingUser,
    refetch: fetchBookings
  };
}; 