import api from '@/lib/axios';
import type { IReserva } from '@/models/models';

export const createReserva = async (data: Partial<IReserva>) => {
  const response = await api.post('/reservas', data);
  return response.data;
};

export const getUserBookings = async () => {
  const response = await api.get('/reservas/user/bookings');
  return response.data;
};

export const getOwnerBookings = async (ownerId: string) => {
  const response = await api.get(`/reservas/owner/${ownerId}`);
  return response.data.data;
};

export const checkReservaAvailability = async (data: {
  canchaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}) => {
  const response = await api.post('/reservas/check', data);
  return response.data;
};

export const getAvailableTimes = async (data: {
  canchaId: string;
  fecha: string;
}) => {
  const response = await api.post('/reservas/available-times', data);
  return response.data;
};

export const getReservasByDate = async (ownerId: string, date: string) => {
  const response = await api.get(`/reservas/owner/${date}/${ownerId}`);
  return response.data;
};

export const getReservaById = async (id: string) => {
  const response = await api.get(`/reservas/${id}`);
  return response.data;
};

export const updateReserva = async (id: string, data: Partial<IReserva>) => {
  const response = await api.put(`/reservas/${id}`, data);
  return response.data;
}; 