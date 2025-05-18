import { useQuery } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/api';

interface CanchaInfo {
  id: string;
  nombre: string;
  tipo: string;
  tipoSuperficie: string;
  imagenUrl: string;
  predio: {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
  };
}

export const useCancha = (canchaId: string) => {
  return useQuery<CanchaInfo>({
    queryKey: ['cancha', canchaId],
    queryFn: async () => {
      const response = await api.get(`/canchas/${canchaId}`);
      return response.data;
    },
    enabled: !!canchaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 