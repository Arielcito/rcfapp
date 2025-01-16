import api from '../config/api';
import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';

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

interface Reserva {
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
  usuario: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
  };
}

export const reservaApi = {
  obtenerTodasReservas: async () => {
    try {
      const response = await api.get('/reservas');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener todas las reservas:', error);
      throw error;
    }
  },

  filtrarReservasPorFecha: (reservas: Reserva[], fecha: Date) => {
    const inicioDia = startOfDay(fecha);
    const finDia = endOfDay(fecha);
    
    return reservas.filter(reserva => {
      const fechaReserva = parseISO(reserva.fechaHora);
      return isAfter(fechaReserva, inicioDia) && isBefore(fechaReserva, finDia);
    });
  },

  filtrarReservasPorEstado: (reservas: Reserva[], estado: string) => {
    return reservas.filter(reserva => 
      reserva.estadoPago.toLowerCase() === estado.toLowerCase()
    );
  },

  filtrarReservasPorCancha: (reservas: Reserva[], canchaId: string) => {
    return reservas.filter(reserva => 
      reserva.cancha.id === canchaId
    );
  },

  obtenerReservasDelDia: async (fecha: Date) => {
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
      const todasLasReservas = await reservaApi.obtenerTodasReservas();
      const reservasFiltradas = reservaApi.filtrarReservasPorFecha(
        todasLasReservas,
        parseISO(fecha)
      );

      // Formatear las reservas para la vista
      return {
        proximasReservas: reservasFiltradas.map(reserva => ({
          id: reserva.id,
          fechaHora: reserva.fechaHora,
          canchaId: reserva.cancha.nombre,
          duracion: reserva.duracion,
          estado: reserva.estadoPago.toLowerCase(),
          usuario: reserva.usuario.nombre,
          precio: Number.parseInt(reserva.precioTotal, 10),
          telefono: reserva.usuario.telefono,
          email: reserva.usuario.email,
          notas: reserva.notasAdicionales || ''
        }))
      };
    } catch (error) {
      console.error('Error al obtener reservas por fecha:', error);
      throw error;
    }
  },

  crearReserva: async (data: CreateReservaDTO) => {
    try {
      const response = await api.post('/reserva', data);
      return response.data;
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

  obtenerReservaPorId: async (id: string) => {
    try {
      const response = await api.get(`/reserva/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      throw error;
    }
  },

  actualizarReserva: async (id: string, data: Partial<CreateReservaDTO>) => {
    try {
      const response = await api.put(`/reserva/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      throw error;
    }
  }
}; 