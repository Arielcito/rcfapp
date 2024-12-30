import api from '@/lib/axios';
import { IPredio } from '@/models/models';

export const createPredio = async (data: Partial<IPredio>) => {
  const response = await api.post('/predios', data);
  return response.data;
};

export const getPredios = async () => {
  const response = await api.get('/predios');
  return response.data;
};

export const getPredioById = async (id: string) => {
  const response = await api.get(`/predios/${id}`);
  return response.data;
};

export const getPrediosByUsuarioId = async (usuarioId: string) => {
  const response = await api.get(`/predios/usuario/${usuarioId}`);
  return response.data;
};

export const updatePredio = async (id: string, data: Partial<IPredio>) => {
  const response = await api.put(`/predios/${id}`, data);
  return response.data;
};

export const deletePredio = async (id: string) => {
  const response = await api.delete(`/predios/${id}`);
  return response.data;
}; 