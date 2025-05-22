import { useQuery } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/api';

interface CanchaInfo {
  id: string;
  nombre: string;
  tipo: string | null;
  tipoSuperficie: string | null;
  imagenUrl: string | null;
  ancho: number | null;
  longitud: number | null;
  capacidadJugadores: number | null;
  equipamientoIncluido: string | null;
  esTechada: boolean;
  estado: string | null;
  montoSeña: number;
  precioPorHora: string;
  predioId: string;
  requiereSeña: boolean;
  tieneIluminacion: boolean;
  ultimoMantenimiento: string | null;
  createdAt: string;
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
      console.log('Cancha encontrada:', response.data);
      return response.data;
    },
    enabled: !!canchaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 