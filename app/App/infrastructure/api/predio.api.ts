import { api } from './api';
import { Predio, Cancha, CanchaFormData, PredioFormData } from '../../types/predio';

// Predio endpoints
export const getPredioInfo = async (predioId: string): Promise<Predio> => {
  const response = await api.get(`/predios/${predioId}`);
  return response.data;
};

export const updatePredioInfo = async (predioId: string, data: PredioFormData): Promise<Predio> => {
  const response = await api.put(`/predios/${predioId}`, data);
  return response.data;
};

// Cancha endpoints
export const getCanchasByPredio = async (predioId: string): Promise<Cancha[]> => {
  const response = await api.get(`/canchas/predio/${predioId}`);
  return response.data;
};

export const createCancha = async (data: CanchaFormData & { predioId: string }): Promise<Cancha> => {
  const response = await api.post('/canchas', data);
  return response.data;
};

export const updateCancha = async (canchaId: string, data: Partial<CanchaFormData>): Promise<Cancha> => {
  const response = await api.put(`/canchas/${canchaId}`, data);
  return response.data;
};

export const deleteCancha = async (canchaId: string): Promise<void> => {
  await api.delete(`/canchas/${canchaId}`);
}; 