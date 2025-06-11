export interface CourtRating {
  id: number;
  userId: number;
  appointmentId: number;
  pitchId: number;
  rating: number; // 1-5 estrellas
  comment?: string;
  ratingAspects: {
    facilityQuality: number;
    cleanliness: number;
    staff: number;
    accessibility: number;
  };
  submittedAt: string;
}

export interface CourtRatingSummary {
  pitchId: number;
  averageRating: number;
  totalRatings: number;
  aspects: {
    facilityQuality: number;
    cleanliness: number;
    staff: number;
    accessibility: number;
  };
} 