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
    mutationFn: async ({ predioId, data }) => {
      return createCancha({ predioId, ...data });
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
