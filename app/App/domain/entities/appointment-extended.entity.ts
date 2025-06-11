import { Appointment } from './appointment.entity';

export interface AppointmentExtended extends Appointment {
  hasCourtRating?: boolean;    // Si ya fue calificada la cancha
  courtRatingId?: number;      // ID de la calificación si existe
  canBeRated?: boolean;        // Si puede ser calificada (está pagada y la fecha ya pasó)
  placeName?: string;          // Nombre del lugar para mostrar en la UI
  pitchName?: string;          // Nombre de la cancha para mostrar en la UI
} 