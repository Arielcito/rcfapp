import { useQuery } from '@tanstack/react-query';
import { api } from '../../infraestructure/api/api';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  telefono?: string;
  role: string;
}

export const useUser = (userId: string) => {
  return useQuery<UserInfo>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 