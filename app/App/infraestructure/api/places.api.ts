import type { Place } from "../../domain/entities/place.entity";
import { api } from "./api";

export const getPredios = async (): Promise<Place[]> => {
  try {
    const response = await api.get('/predios');
    return response.data;
  } catch (error) {
    console.error("Error al obtener predios:", error);
    return [];
  }
};

export const fetchOwnerPlace = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    console.log('response', response.data);
    if (response.data && response.data.role === 'OWNER') {
      const predioResponse = await api.get(`/predios/owner/${userId}`);
      return predioResponse.data;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar el predio del dueño:', error);
    return null;
  }
};

