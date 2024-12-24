import type { User } from '../../domain/entities/user.entity';
import { api } from './api';

interface UserProfile {
  email: string;
  name?: string;
  phone?: string;
  role?: string;
}

export const getProfileInfo = async (userEmail: string): Promise<User> => {
  try {
    const response = await api.get<User>('/users/me');
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error obteniendo información del perfil: ", error);
    throw error;
  }
};

export const updateProfile = async (userData: Partial<UserProfile>): Promise<User> => {
  try {
    const response = await api.put<User>(`/users/${userData.email}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error actualizando el perfil: ", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/users/auth/logout');
  } catch (error) {
    console.error("Error al cerrar sesión: ", error);
    throw error;
  }
};