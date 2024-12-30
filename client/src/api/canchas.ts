import api from '@/lib/axios';
import type { ICancha } from '@/models/models';

export const createCancha = async (data: Partial<ICancha>) => {
  const response = await api.post('/canchas', data);
  return response.data;
};

export const getCanchas = async () => {
  const response = await api.get('/canchas');
  return response.data;
};

export const getCanchaById = async (id: string) => {
  const response = await api.get(`/canchas/${id}`);
  return response.data;
};

export const getCanchasByPredioId = async (predioId: string) => {
  const response = await api.get(`/canchas/predio/${predioId}`);
  return response.data;
};

export const updateCancha = async (id: string, data: Partial<ICancha>) => {
  const response = await api.put(`/canchas/${id}`, data);
  return response.data;
};

export const deleteCancha = async (id: string) => {
  const response = await api.delete(`/canchas/${id}`);
  return response.data;
}; 