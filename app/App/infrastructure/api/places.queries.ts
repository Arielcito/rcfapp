import { useQuery } from '@tanstack/react-query';
import { getPredios, fetchOwnerPlace, getPrediosWithAvailableCourts, getAvailableCourts } from './places.api';
import type { Place } from '../../domain/entities/place.entity';
import type { Cancha, Predio } from '../../types/predio';

export const usePredios = () => {
  return useQuery<Predio[]>({
    queryKey: ['predios'],
    queryFn: getPredios,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePrediosWithAvailableCourts = (fecha: string, hora: string, deporteId?: string) => {
  return useQuery<Place[]>({
    queryKey: ['predios-available-courts', fecha, hora, deporteId],
    queryFn: () => getPrediosWithAvailableCourts(fecha, hora, deporteId),
    enabled: !!fecha && !!hora,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAvailableCourts = (predioId: string, fecha: string, hora: string) => {
  return useQuery<Cancha[]>({
    queryKey: ['available-courts', predioId, fecha, hora],
    queryFn: () => getAvailableCourts(predioId, fecha, hora),
    enabled: !!predioId && !!fecha && !!hora,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useOwnerPlace = (userId: string) => {
  return useQuery<Place | null>({
    queryKey: ['ownerPlace', userId],
    queryFn: () => fetchOwnerPlace(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 