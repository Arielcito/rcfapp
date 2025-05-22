import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { getAllAppointments } from './appointments.api';
import { api } from './api';

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

interface UpdateReservaDTO {
  fechaHora?: Date;
  duracion?: number;
  precioTotal?: number;
  estadoPago?: string;
  metodoPago?: string;
  notasAdicionales?: string;
  pagoId?: string;
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

interface RatePredioData {
  rating: number;
  predioId: string;
  userId: string;
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

  actualizarReserva: async (id: string, data: Partial<UpdateReservaDTO>): Promise<Reserva> => {
    try {
      const response = await api.put(`/reservas/${id}`, data);
      return response.data as Reserva;
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      throw error;
    }
  },

  obtenerReservasUsuario: async () => {
    try {
      console.log('🔍 [reserva.api] Iniciando obtenerReservasUsuario');
      const response = await api.get('/reservas/user/bookings');
      console.log('📦 [reserva.api] Respuesta del servidor:', JSON.stringify(response.data, null, 2));

      return response.data.map((reserva: Appointment) => {
        console.log('🔄 [reserva.api] Procesando reserva:', JSON.stringify(reserva, null, 2));
        console.log('📝 [reserva.api] Description value:', reserva.place?.description);
        
        const description = reserva.place?.description || '';
        console.log('🔍 [reserva.api] Description after fallback:', description);
        
        const [tipo = 'Fútbol', tipoSuperficie = 'No especificado'] = description ? description.split('-').map(s => s.trim()) : ['Fútbol', 'No especificado'];
        console.log('🏷️ [reserva.api] Tipo y Superficie:', { tipo, tipoSuperficie });

        const processedReserva = {
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
            tipo,
            tipoSuperficie,
            imageUrl: reserva.place?.imageUrl || 'https://example.com/placeholder.jpg'
          },
          predio: {
            id: reserva.place?.id || '',
            nombre: reserva.place?.name || 'Sin nombre',
            direccion: reserva.place?.address || 'Sin dirección',
            telefono: reserva.place?.telefono || 'Sin teléfono'
          },
          metodoPago: reserva.metodoPago
        };

        console.log('✅ [reserva.api] Reserva procesada:', JSON.stringify(processedReserva, null, 2));
        return processedReserva;
      });
    } catch (error) {
      console.error('❌ [reserva.api] Error al obtener reservas del usuario:', error);
      throw error;
    }
  },

  obtenerReservasUsuarioFiltradas: async (userId: string) => {
    try {
      console.log('Obteniendo todas las reservas para filtrar por usuario');
      const allAppointments = await getAllAppointments();
      // Cast the result to our interface
      const typedAppointments = allAppointments as Appointment[];
      
      const filteredAppointments = userId 
        ? typedAppointments.filter(app => app.userId === userId)
        : typedAppointments;
      
      
      return filteredAppointments;
    } catch (error) {
      console.error('Error al obtener y filtrar reservas del usuario:', error);
      throw error;
    }
  },

  ratePredio: async (reservaId: string, data: RatePredioData) => {
    try {
      const response = await api.post(`/reservas/${reservaId}/rate`, data);
      return response.data;
    } catch (error) {
      console.error('Error al calificar el predio:', error);
      throw error;
    }
  },
}; 