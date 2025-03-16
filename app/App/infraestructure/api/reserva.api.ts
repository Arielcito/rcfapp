import api from '../config/api';
import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { getAllAppointments } from './appointments.api';

interface Reserva {
  id: string;
  canchaId: string;
  userId: string;
  fechaHora: Date | string;
  duracion: number;
  precioTotal: string;
  estadoPago: string;
  metodoPago: string;
  fechaReserva: Date | string;
  notasAdicionales: string;
  pagoId: string | null;
}

interface ReservaDisponibilidad {
  canchaId: string;
  fechaHora: string;
  duracion: number;
}

interface CreateReservaDTO {
  canchaId: string;
  userId: string;
  fechaHora: string;
  duracion: number;
  precioTotal?: number;
  metodoPago?: string;
  notasAdicionales?: string;
}

interface ReservaResponse {
  id: string;
  fechaHora: string;
  duracion: number;
  precioTotal: string;
  estadoPago: string;
  metodoPago?: string;
  notasAdicionales?: string;
  cancha: {
    id: string;
    nombre: string;
    tipo: string;
    tipoSuperficie: string;
  };
  predio: {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
  };
}

interface Appointment {
  userId?: string;
  appointmentId: string | number;
  appointmentDate: string;
  appointmentTime: string;
  estado: string;
  email?: string;
  duracion?: number;
  precioTotal?: string | number;
  metodoPago?: string;
  place?: {
    id?: string;
    name?: string;
    description?: string;
    address?: string;
    imageUrl?: string;
    telefono?: string;
  };
}

export const reservaApi = {
  obtenerTodasReservas: async (): Promise<ReservaResponse[]> => {
    try {
      const response = await api.get('/reservas');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener todas las reservas:', error);
      throw error;
    }
  },

  filtrarReservasPorFecha: (reservas: ReservaResponse[], fecha: Date): ReservaResponse[] => {
    const inicioDia = startOfDay(fecha);
    const finDia = endOfDay(fecha);
    
    return reservas.filter(reserva => {
      const fechaReserva = parseISO(reserva.fechaHora as string);
      return isAfter(fechaReserva, inicioDia) && isBefore(fechaReserva, finDia);
    });
  },

  filtrarReservasPorEstado: (reservas: ReservaResponse[], estado: string) => {
    return reservas.filter(reserva => 
      reserva.estadoPago.toLowerCase() === estado.toLowerCase()
    );
  },

  filtrarReservasPorCancha: (reservas: ReservaResponse[], canchaId: string) => {
    return reservas.filter(reserva => 
      reserva.cancha.id === canchaId
    );
  },

  obtenerReservasDelDia: async (fecha: Date): Promise<ReservaResponse[]> => {
    try {
      const todasLasReservas = await reservaApi.obtenerTodasReservas();
      return reservaApi.filtrarReservasPorFecha(todasLasReservas, fecha);
    } catch (error) {
      console.error('Error al obtener reservas del día:', error);
      throw error;
    }
  },

  obtenerReservasPorFecha: async (fecha: string, ownerId: string) => {
    try {
      const response = await api.get(`/reserva/owner/${fecha}/${ownerId}`);
      return {
        proximasReservas: response.data.map((reserva: ReservaResponse) => ({
          id: reserva.id,
          fechaHora: reserva.fechaHora,
          canchaId: reserva.cancha.nombre,
          duracion: reserva.duracion,
          estado: reserva.estadoPago.toLowerCase(),
          precio: Number.parseInt(reserva.precioTotal, 10),
          notas: reserva.notasAdicionales || '',
          cancha: reserva.cancha,
          predio: reserva.predio
        }))
      };
    } catch (error) {
      console.error('Error al obtener reservas por fecha:', error);
      throw error;
    }
  },

  crearReserva: async (data: CreateReservaDTO): Promise<Reserva> => {
    try {
      const response = await api.post('/reserva', data);
      return response.data as Reserva;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  },

  verificarDisponibilidad: async (data: ReservaDisponibilidad) => {
    try {
      const response = await api.post('/reserva/check', data);
      return response.data;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  },

  obtenerHorariosDisponibles: async (fecha: string) => {
    try {
      const response = await api.post('/reserva/available-times', { fecha });
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      throw error;
    }
  },

  obtenerReservaPorId: async (id: string): Promise<Reserva> => {
    try {
      const response = await api.get(`/reserva/${id}`);
      return response.data as Reserva;
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      throw error;
    }
  },

  actualizarReserva: async (id: string, data: Partial<CreateReservaDTO>): Promise<Reserva> => {
    try {
      const response = await api.put(`/reserva/${id}`, data);
      return response.data as Reserva;
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      throw error;
    }
  },

  obtenerReservasUsuario: async () => {
    try {
      console.log('Obteniendo reservas del usuario');
      const response = await api.get('/reservas/user/bookings');
      console.log('Respuesta del servidor:', response.data);

      return response.data.map((reserva: Appointment) => ({
        appointmentId: reserva.appointmentId,
        appointmentDate: reserva.appointmentDate,
        appointmentTime: reserva.appointmentTime,
        estado: reserva.estado.toLowerCase(),
        duracion: reserva.duracion || 60,
        precioTotal: reserva.precioTotal || '0',
        imageUrl: reserva.place?.imageUrl || 'https://example.com/placeholder.jpg',
        place: {
          ...reserva.place,
          imageUrl: reserva.place?.imageUrl || 'https://example.com/placeholder.jpg'
        },
        cancha: {
          id: reserva.place?.id || '',
          nombre: reserva.place?.name || 'Sin nombre',
          tipo: reserva.place?.description?.split('-')?.[0]?.trim() || 'Fútbol',
          tipoSuperficie: reserva.place?.description?.split('-')?.[1]?.trim() || 'No especificado',
          imageUrl: reserva.place?.imageUrl || 'https://example.com/placeholder.jpg'
        },
        predio: {
          id: reserva.place?.id || '',
          nombre: reserva.place?.name || 'Sin nombre',
          direccion: reserva.place?.address || 'Sin dirección',
          telefono: reserva.place?.telefono || 'Sin teléfono'
        },
        metodoPago: reserva.metodoPago
      }));
    } catch (error) {
      console.error('Error al obtener reservas del usuario:', error);
      throw error;
    }
  },

  obtenerReservasUsuarioFiltradas: async (userId: string) => {
    try {
      console.log('Obteniendo todas las reservas para filtrar por usuario');
      const allAppointments = await getAllAppointments();
      console.log('Appointments:', allAppointments);
      // Cast the result to our interface
      const typedAppointments = allAppointments as Appointment[];
      
      const filteredAppointments = userId 
        ? typedAppointments.filter(app => app.userId === userId)
        : typedAppointments;
      
      console.log(`Reservas filtradas para usuario con ID ${userId}: ${filteredAppointments.length}`);
      
      return filteredAppointments.map((reserva) => ({
        appointmentId: reserva.appointmentId,
        appointmentDate: reserva.appointmentDate,
        appointmentTime: reserva.appointmentTime,
        estado: reserva.estado.toLowerCase(),
        duracion: 60, // Valor por defecto si no está disponible
        precioTotal: '0', // Valor por defecto si no está disponible
        imageUrl: 'https://example.com/placeholder.jpg',
        place: {
          name: 'Cancha',
          description: 'Fútbol - Césped sintético',
          imageUrl: 'https://example.com/placeholder.jpg',
          telefono: '555-1234'
        },
        cancha: {
          id: '1',
          nombre: 'Cancha',
          tipo: 'Fútbol',
          tipoSuperficie: 'Césped sintético',
          imageUrl: 'https://example.com/placeholder.jpg'
        },
        predio: {
          id: '1',
          nombre: 'Predio Deportivo',
          direccion: 'Calle ejemplo 123',
          telefono: '555-1234'
        },
        metodoPago: 'No especificado'
      }));
    } catch (error) {
      console.error('Error al obtener y filtrar reservas del usuario:', error);
      throw error;
    }
  }
}; 