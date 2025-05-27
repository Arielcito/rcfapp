import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Predio, Cancha, CanchaFormData, PredioFormData } from '../../types/predio';
import {
  getPredioInfo,
  updatePredioInfo,
  getCanchasByPredio,
  createCancha,
  updateCancha,
  deleteCancha,
} from '../../infrastructure/api/predio.api';

// Mock data
const mockPredio: Predio = {
  id: '1',
  usuarioId: 'owner-1',
  nombre: 'Complejo Deportivo San Martín',
  direccion: 'Av. San Martín 1234',
  ciudad: 'Buenos Aires',
  provincia: 'Buenos Aires',
  telefono: '+54 11 1234-5678',
  email: 'info@complejoSanMartin.com',
  capacidadEstacionamiento: 50,
  tieneVestuarios: true,
  tieneCafeteria: true,
  horarioApertura: '08:00',
  horarioCierre: '23:00',
  diasOperacion: 'Lunes a Domingo',
  imagenUrl: 'https://example.com/predio.jpg',
};

const mockCanchas: Cancha[] = [
  {
    id: '1',
    nombre: 'Cancha 1 - Fútbol 11',
    tipo: 'Fútbol',
    tipoSuperficie: 'Césped sintético',
    imagenUrl: 'https://example.com/cancha1.jpg',
    ancho: 68,
    longitud: 105,
    capacidadJugadores: 22,
    equipamientoIncluido: 'Arcos, redes, pelotas',
    esTechada: false,
    estado: 'Excelente',
    montoSeña: 5000,
    precioPorHora: '15000',
    predioId: '1',
    requiereSeña: true,
    tieneIluminacion: true,
    ultimoMantenimiento: '2024-01-15',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    nombre: 'Cancha 2 - Fútbol 5',
    tipo: 'Fútbol 5',
    tipoSuperficie: 'Césped sintético',
    imagenUrl: 'https://example.com/cancha2.jpg',
    ancho: 30,
    longitud: 50,
    capacidadJugadores: 10,
    equipamientoIncluido: 'Arcos, redes',
    esTechada: true,
    estado: 'Muy bueno',
    montoSeña: 3000,
    precioPorHora: '8000',
    predioId: '1',
    requiereSeña: true,
    tieneIluminacion: true,
    ultimoMantenimiento: '2024-01-10',
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    nombre: 'Cancha 3 - Paddle',
    tipo: 'Paddle',
    tipoSuperficie: 'Cemento con arena',
    imagenUrl: 'https://example.com/cancha3.jpg',
    ancho: 10,
    longitud: 20,
    capacidadJugadores: 4,
    equipamientoIncluido: 'Raquetas disponibles',
    esTechada: true,
    estado: 'Bueno',
    montoSeña: 2000,
    precioPorHora: '6000',
    predioId: '1',
    requiereSeña: false,
    tieneIluminacion: true,
    ultimoMantenimiento: '2024-01-05',
    createdAt: '2024-01-01',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const usePredioConfig = (predioId: string) => {
  return useQuery<Predio>({
    queryKey: ['predio-config', predioId],
    queryFn: () => getPredioInfo(predioId),
    enabled: !!predioId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePredioCanchas = (predioId: string) => {
  return useQuery<Cancha[]>({
    queryKey: ['predio-canchas', predioId],
    queryFn: () => getCanchasByPredio(predioId),
    enabled: !!predioId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdatePredio = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Predio, Error, { predioId: string; data: PredioFormData }>({
    mutationFn: async ({ predioId, data }) => {
      return updatePredioInfo(predioId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predio-config', variables.predioId] });
    },
  });
};

export const useCreateCancha = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Cancha, Error, { predioId: string; data: CanchaFormData }>({
    mutationFn: async ({ data }) => {
      return createCancha(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predio-canchas', variables.predioId] });
    },
  });
};

export const useUpdateCancha = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Cancha, Error, { predioId: string; canchaId: string; data: Partial<CanchaFormData> }>({
    mutationFn: async ({ canchaId, data }) => {
      return updateCancha(canchaId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predio-canchas', variables.predioId] });
    },
  });
};

export const useDeleteCancha = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { predioId: string; canchaId: string }>({
    mutationFn: async ({ canchaId }) => {
      return deleteCancha(canchaId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predio-canchas', variables.predioId] });
    },
  });
}; 