import type { Place } from "../../domain/entities/place.entity";
import { api } from "./api";
import { AxiosError } from 'axios';

export const getPredios = async (): Promise<Place[]> => {
  try {
    const response = await api.get('/predios');
    console.log('response getPredios', response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener predios:", error);
    return [];
  }
};

export const fetchOwnerPlace = async (userId: string) => {
  try {
    console.log('fetchOwnerPlace', userId);
    const response = await api.get(`/users/${userId}`);
    const userData = response.data;
    console.log('response fetchOwnerPlace', userData);

    if (!userData) {
      console.warn('No se encontró información del usuario');
      return null;
    }

    if (userData.role !== 'OWNER') {
      console.warn('El usuario no tiene rol de OWNER');
      return null;
    }

    if (!userData.predioTrabajo) {
      console.warn('El usuario no tiene predio asignado');
      return null;
    }

    try {
      const predioResponse = await api.get(`/predios/${userData.predioTrabajo}`);
      console.log('predioResponse fetchOwnerPlace', predioResponse.data);
      return predioResponse.data;
    } catch (predioError) {
      if ((predioError as AxiosError)?.response?.status === 404) {
        console.warn('No se encontró el predio con ID:', userData.predioTrabajo);
        return null;
      }
      console.error('Error al obtener el predio:', predioError);
      throw predioError;
    }
  } catch (error) {
    console.error('Error al buscar el predio del dueño:', error);
    throw error;
  }
};

