import api from '../config/api';

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

export const reservaApi = {
  obtenerReservasUsuario: async () => {
    try {
      const response = await api.get('/reserva/user/bookings');
      return response.data;
    } catch (error) {
      console.error('Error al obtener reservas del usuario:', error);
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

  obtenerReservasPorFecha: async (fecha: string, ownerId: string) => {
    try {
      const response = await api.get(`/reserva/owner/${fecha}/${ownerId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reservas por fecha:', error);
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