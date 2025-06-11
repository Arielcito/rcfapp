import { useQuery } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/api';

export interface Deporte {
  id: string;
  nombre: string;
  descripcion?: string;
}

const fetchDeportes = async (): Promise<Deporte[]> => {
  const response = await api.get('/deportes');
  return response.data;
};

export const useDeportes = () => {
  return useQuery({
    queryKey: ['deportes'],
    queryFn: fetchDeportes,
  });
}; 