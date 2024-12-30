import api from '@/lib/axios';
import type { IMovimientoCaja } from '@/models/models';

export const createMovimiento = async (data: Partial<IMovimientoCaja>) => {
  const response = await api.post('/movimientos', data);
  return response.data;
};

export const getMovimientoById = async (id: string) => {
  const response = await api.get(`/movimientos/${id}`);
  return response.data;
};

export const getMovimientosByPredio = async (predioId: string) => {
  const response = await api.get(`/movimientos/predio/${predioId}`);
  return response.data;
};

export const updateMovimiento = async (id: string, data: Partial<IMovimientoCaja>) => {
  const response = await api.put(`/movimientos/${id}`, data);
  return response.data;
}; 