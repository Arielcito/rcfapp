import { useState, useEffect, useCallback } from 'react';
import { reservaApi } from '../../infraestructure/api/reserva.api';
import { useCurrentUser } from '../context/CurrentUserContext';
import moment from 'moment';
import { Booking } from '../../types/booking';

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
    const fechaHora = moment(reserva.fechaHora || reserva.bookingDateTime);
    return {
      id: reserva.id,
      fechaHora: reserva.fechaHora || reserva.bookingDateTime,
      estadoPago: (reserva.estadoPago || reserva.estado).toLowerCase(),
      duracion: reserva.duracion,
      precioTotal: reserva.precioTotal,
      metodoPago: reserva.metodoPago,
      cancha: {
        id: reserva.cancha?.id,
        nombre: reserva.cancha?.nombre || 'Sin nombre',
        tipo: reserva.cancha?.tipo || 'Fútbol',
        tipoSuperficie: reserva.cancha?.tipoSuperficie || 'No especificado',
        imagenUrl: reserva.cancha?.imagenUrl || 'https://example.com/placeholder.jpg',
        longitud: reserva.cancha?.longitud || 0,
        ancho: reserva.cancha?.ancho || 0,
        caracteristicas: [],
        precioPorHora: 0,
        requiereSeña: false,
        montoSeña: 0,
        estado: 'activo',
        predioId: '',
        numero: 0,
        tipo_superficie: ''
      },
      predio: {
        id: reserva.predio?.id,
        nombre: reserva.predio?.nombre || 'Sin nombre',
        telefono: reserva.predio?.telefono || ''
      },
      notasAdicionales: reserva.notasAdicionales
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
          booking.estadoPago === 'pendiente'
        ),
        past: mappedBookings.filter((booking: Booking) => 
          booking.estadoPago === 'pagado'
        ),
        cancelled: mappedBookings.filter((booking: Booking) => 
          booking.estadoPago === 'cancelado'
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