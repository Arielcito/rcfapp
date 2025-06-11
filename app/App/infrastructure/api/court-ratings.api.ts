import { api } from "./api";
import type { CourtRating, CourtRatingSummary } from "../../domain/entities/court-rating.entity";

export const submitCourtRating = async (ratingData: Omit<CourtRating, 'id' | 'submittedAt'>): Promise<CourtRating> => {
  try {
    const { data } = await api.post('/court-ratings', ratingData);
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error submitting court rating:", error);
    throw error;
  }
};

export const getCourtRating = async (pitchId: number): Promise<CourtRatingSummary> => {
  try {
    const { data } = await api.get(`/court-ratings/pitch/${pitchId}`);
    return data.success ? data.data : { 
      pitchId, 
      averageRating: 0, 
      totalRatings: 0,
      aspects: {
        facilityQuality: 0,
        cleanliness: 0,
        staff: 0,
        accessibility: 0,
      }
    };
  } catch (error) {
    console.error("Error fetching court rating:", error);
    throw error;
  }
};

export const getUserCourtRating = async (appointmentId: number): Promise<CourtRating | null> => {
  try {
    const { data } = await api.get(`/court-ratings/appointment/${appointmentId}`);
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching user court rating:", error);
    return null;
  }
};

export const checkPendingRatings = async (): Promise<number[]> => {
  try {
    const { data } = await api.get('/court-ratings/pending');
    
    // Verificar que la respuesta tenga el formato esperado
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Si la estructura no es la esperada, retornar array vacío
    console.log('checkPendingRatings: respuesta inesperada de la API:', data);
    return [];
  } catch (error) {
    console.error("Error checking pending ratings:", error);
    
    // En lugar de retornar array vacío inmediatamente, verificar si es un error 404
    // que podría significar que el endpoint no existe aún
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        console.log('Endpoint /court-ratings/pending no encontrado, retornando array vacío');
        return [];
      }
    }
    
    return [];
  }
}; 