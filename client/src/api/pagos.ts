import api from '@/lib/axios';
import type { IPago } from '@/models/models';

export const createPago = async (data: Partial<IPago>) => {
  const response = await api.post('/pagos', data);
  return response.data;
};

export const getPagoById = async (id: string) => {
  const response = await api.get(`/pagos/${id}`);
  return response.data;
};

export const updatePago = async (id: string, data: Partial<IPago>) => {
  const response = await api.put(`/pagos/${id}`, data);
  return response.data;
}; 