import { z } from 'zod';

// Zod schemas para validación
export const createCourtRatingSchema = z.object({
  reservaId: z.string().uuid('ID de reserva debe ser un UUID válido'),
  canchaId: z.string().uuid('ID de cancha debe ser un UUID válido'),
  rating: z.number().int().min(1, 'Rating mínimo es 1').max(5, 'Rating máximo es 5'),
  comment: z.string().optional(),
  facilityQuality: z.number().int().min(0).max(5).default(0),
  cleanliness: z.number().int().min(0).max(5).default(0),
  staff: z.number().int().min(0).max(5).default(0),
  accessibility: z.number().int().min(0).max(5).default(0),
});

export const getCourtRatingByIdSchema = z.object({
  id: z.string().uuid('ID debe ser un UUID válido'),
});

export const getCourtRatingsByReservaSchema = z.object({
  reservaId: z.string().uuid('ID de reserva debe ser un UUID válido'),
});

export const getCourtRatingsByCanchaSchema = z.object({
  canchaId: z.string().uuid('ID de cancha debe ser un UUID válido'),
});

// TypeScript interfaces
export interface CreateCourtRatingDTO {
  reservaId: string;
  canchaId: string;
  rating: number;
  comment?: string;
  facilityQuality: number;
  cleanliness: number;
  staff: number;
  accessibility: number;
}

export interface CourtRatingResponse {
  id: string;
  userId: string;
  reservaId: string;
  canchaId: string;
  rating: number;
  comment?: string;
  facilityQuality: number;
  cleanliness: number;
  staff: number;
  accessibility: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourtRatingSummaryResponse {
  canchaId: string;
  averageRating: number;
  totalRatings: number;
  aspects: {
    facilityQuality: number;
    cleanliness: number;
    staff: number;
    accessibility: number;
  };
} 