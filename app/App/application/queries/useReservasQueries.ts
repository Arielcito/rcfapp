import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservaApi } from '../../infrastructure/api/reserva.api';
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

const mapReservaToBooking = (reserva: any): Booking => {
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
};

export const useBookings = () => {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const reservas = await reservaApi.obtenerReservasUsuarioFiltradas(currentUser.id);
      const mappedBookings = reservas.map(mapReservaToBooking);
      
      return {
        active: mappedBookings.filter((booking: Booking) => 
          booking.estado === 'pagado' || booking.estado === 'pendiente'
        ),
        past: mappedBookings.filter((booking: Booking) => 
          booking.estado === 'pendiente'
        ),
        cancelled: mappedBookings.filter((booking: Booking) => 
          booking.estado === 'cancelado'
        )
      } as BookingsState;
    },
    enabled: !!currentUser?.id
  });

  return {
    bookings,
    isLoading,
    error,
    refetch
  };
};

export const useCreateReserva = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservaApi.crearReserva,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};

export const useUpdateReserva = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      reservaApi.actualizarReserva(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};

export const useCheckAvailability = () => {
  return useMutation({
    mutationFn: reservaApi.verificarDisponibilidad
  });
};

export const useAvailableTimes = (fecha: string) => {
  return useQuery({
    queryKey: ['availableTimes', fecha],
    queryFn: () => reservaApi.obtenerHorariosDisponibles(fecha),
    enabled: !!fecha
  });
}; 