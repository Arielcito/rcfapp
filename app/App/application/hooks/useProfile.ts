import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfileInfo } from '../../infrastructure/api/user.api';
import { fetchOwnerPlace } from '../../infrastructure/api/places.api';
import { api } from '../../infrastructure/api/api';
import { User } from '../context/CurrentUserContext';
import { Predio } from '../../types/predio';

interface ProfileData {
  name: string;
  telefono: string | null;
  email: string;
}

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfileInfo(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: ProfileData }) => {
      const response = await api.put(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
      // Update current user data in cache
      queryClient.setQueryData(['user', variables.userId], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
    },
  });
};

export const useOwnerPlace = (userId: string, isOwner: boolean) => {
  return useQuery<Predio | null>({
    queryKey: ['owner-place', userId],
    queryFn: async () => {
      try {
        console.log('🏟️ [useOwnerPlace] Iniciando consulta para owner:', userId);
        const result = await fetchOwnerPlace(userId);
        console.log('🏟️ [useOwnerPlace] Resultado de la consulta:', {
          success: !!result,
          predioData: result ? 'Predio encontrado' : 'No se encontró predio',
          details: result
        });
        return result;
      } catch (error) {
        console.error('❌ [useOwnerPlace] Error al obtener el predio:', error);
        throw error;
      }
    },
    enabled: !!userId && isOwner,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1 // Solo reintentar una vez en caso de error
  });
}; 