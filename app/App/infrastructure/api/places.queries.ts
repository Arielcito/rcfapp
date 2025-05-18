import { useQuery } from '@tanstack/react-query';
import { getPredios, fetchOwnerPlace } from './places.api';
import type { Place } from '../../domain/entities/place.entity';

export const usePredios = () => {
  return useQuery<Place[]>({
    queryKey: ['predios'],
    queryFn: getPredios,
    staleTime: 5 * 60 * 1000, // 5 minutes
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