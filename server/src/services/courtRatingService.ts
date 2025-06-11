import { db } from '../db';
import { courtRatings, reservas, canchas, predios, users } from '../db/schema';
import { eq, and, avg, count, desc } from 'drizzle-orm';
import type { CreateCourtRatingDTO, CourtRatingResponse, CourtRatingSummaryResponse } from '../types/courtRating';

export class CourtRatingService {
  async createCourtRating(userId: string, data: CreateCourtRatingDTO): Promise<CourtRatingResponse> {
    console.log('[CourtRatingService] Iniciando creación de calificación');
    console.log('[CourtRatingService] Datos recibidos:', JSON.stringify({ userId, ...data }, null, 2));
    
    try {
      // Verificar que la reserva existe y pertenece al usuario
      const [reserva] = await db.select()
        .from(reservas)
        .where(and(
          eq(reservas.id, data.reservaId),
          eq(reservas.userId, userId)
        ));

      if (!reserva) {
        throw new Error('Reserva no encontrada o no pertenece al usuario');
      }

      // Verificar que la reserva esté completada (fecha ya pasó)
      const now = new Date();
      if (reserva.fechaHora > now) {
        throw new Error('No se puede calificar una reserva que aún no ha ocurrido');
      }

      // Verificar que la reserva esté pagada
      if (reserva.estadoPago !== 'pagado' && reserva.estadoPago !== 'Pagado') {
        throw new Error('Solo se pueden calificar reservas pagadas');
      }

      // Verificar que no exista ya una calificación para esta reserva
      const [existingRating] = await db.select()
        .from(courtRatings)
        .where(and(
          eq(courtRatings.userId, userId),
          eq(courtRatings.reservaId, data.reservaId)
        ));

      if (existingRating) {
        throw new Error('Ya existe una calificación para esta reserva');
      }

      // Crear la calificación
      const ratingData = {
        userId,
        reservaId: data.reservaId,
        canchaId: data.canchaId,
        rating: data.rating,
        comment: data.comment,
        facilityQuality: data.facilityQuality,
        cleanliness: data.cleanliness,
        staff: data.staff,
        accessibility: data.accessibility,
      };

      console.log('[CourtRatingService] Datos preparados para inserción:', JSON.stringify(ratingData, null, 2));

      const [nuevaCalificacion] = await db.insert(courtRatings)
        .values(ratingData)
        .returning();

      console.log('[CourtRatingService] Calificación creada exitosamente:', nuevaCalificacion);
      return nuevaCalificacion as CourtRatingResponse;
    } catch (error) {
      console.error('[CourtRatingService] Error al crear calificación:', error);
      throw new Error(`Error al crear la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getCourtRatingById(id: string): Promise<CourtRatingResponse | null> {
    try {
      const [rating] = await db.select()
        .from(courtRatings)
        .where(eq(courtRatings.id, id));

      return rating as CourtRatingResponse || null;
    } catch (error) {
      console.error('[CourtRatingService] Error al obtener calificación:', error);
      throw new Error('Error al obtener la calificación');
    }
  }

  async getCourtRatingsByReserva(reservaId: string): Promise<CourtRatingResponse | null> {
    try {
      const [rating] = await db.select()
        .from(courtRatings)
        .where(eq(courtRatings.reservaId, reservaId));

      return rating as CourtRatingResponse || null;
    } catch (error) {
      console.error('[CourtRatingService] Error al obtener calificación por reserva:', error);
      throw new Error('Error al obtener la calificación');
    }
  }

  async getCourtRatingsByCancha(canchaId: string): Promise<CourtRatingResponse[]> {
    try {
      const ratings = await db.select({
        id: courtRatings.id,
        userId: courtRatings.userId,
        reservaId: courtRatings.reservaId,
        canchaId: courtRatings.canchaId,
        rating: courtRatings.rating,
        comment: courtRatings.comment,
        facilityQuality: courtRatings.facilityQuality,
        cleanliness: courtRatings.cleanliness,
        staff: courtRatings.staff,
        accessibility: courtRatings.accessibility,
        submittedAt: courtRatings.submittedAt,
        createdAt: courtRatings.createdAt,
        updatedAt: courtRatings.updatedAt,
        userName: users.name,
      })
      .from(courtRatings)
      .leftJoin(users, eq(courtRatings.userId, users.id))
      .where(eq(courtRatings.canchaId, canchaId))
      .orderBy(desc(courtRatings.submittedAt));

      return ratings as CourtRatingResponse[];
    } catch (error) {
      console.error('[CourtRatingService] Error al obtener calificaciones por cancha:', error);
      throw new Error('Error al obtener las calificaciones');
    }
  }

  async getCourtRatingSummary(canchaId: string): Promise<CourtRatingSummaryResponse> {
    try {
      const summary = await db.select({
        averageRating: avg(courtRatings.rating),
        totalRatings: count(courtRatings.id),
        avgFacilityQuality: avg(courtRatings.facilityQuality),
        avgCleanliness: avg(courtRatings.cleanliness),
        avgStaff: avg(courtRatings.staff),
        avgAccessibility: avg(courtRatings.accessibility),
      })
      .from(courtRatings)
      .where(eq(courtRatings.canchaId, canchaId));

      const result = summary[0];

      return {
        canchaId,
        averageRating: Number(result.averageRating) || 0,
        totalRatings: Number(result.totalRatings) || 0,
        aspects: {
          facilityQuality: Number(result.avgFacilityQuality) || 0,
          cleanliness: Number(result.avgCleanliness) || 0,
          staff: Number(result.avgStaff) || 0,
          accessibility: Number(result.avgAccessibility) || 0,
        },
      };
    } catch (error) {
      console.error('[CourtRatingService] Error al obtener resumen de calificaciones:', error);
      throw new Error('Error al obtener el resumen de calificaciones');
    }
  }

  async getPendingRatingsByUser(userId: string): Promise<string[]> {
    try {
      // Obtener todas las reservas del usuario que estén pagadas y ya hayan ocurrido
      const now = new Date();
      const reservasPagadas = await db.select({
        id: reservas.id,
      })
      .from(reservas)
      .where(and(
        eq(reservas.userId, userId),
        eq(reservas.estadoPago, 'pagado')
      ))
      .orderBy(desc(reservas.fechaHora));

      // Obtener las reservas que ya tienen calificación
      const reservasCalificadas = await db.select({
        reservaId: courtRatings.reservaId,
      })
      .from(courtRatings)
      .where(eq(courtRatings.userId, userId));

      const idsCalificadas = reservasCalificadas.map(r => r.reservaId);
      
      // Filtrar las reservas que no tienen calificación
      const reservasPendientes = reservasPagadas
        .filter(reserva => !idsCalificadas.includes(reserva.id))
        .map(reserva => reserva.id);

      return reservasPendientes;
    } catch (error) {
      console.error('[CourtRatingService] Error al obtener calificaciones pendientes:', error);
      throw new Error('Error al obtener las calificaciones pendientes');
    }
  }

  async getUserCourtRatingForReserva(userId: string, reservaId: string): Promise<CourtRatingResponse | null> {
    try {
      const [rating] = await db.select()
        .from(courtRatings)
        .where(and(
          eq(courtRatings.userId, userId),
          eq(courtRatings.reservaId, reservaId)
        ));

      return rating as CourtRatingResponse || null;
    } catch (error) {
      console.error('[CourtRatingService] Error al obtener calificación del usuario:', error);
      throw new Error('Error al obtener la calificación del usuario');
    }
  }
} 