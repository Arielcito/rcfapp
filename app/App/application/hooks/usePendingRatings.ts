import { useState, useEffect, useCallback } from 'react';
import { getAppointmentsByUser } from '../../infrastructure/api/appointments.api';
import { checkPendingRatings } from '../../infrastructure/api/court-ratings.api';
import type { AppointmentExtended } from '../../domain/entities/appointment-extended.entity';
import moment from 'moment';

export const usePendingRatings = () => {
  const [pendingRatings, setPendingRatings] = useState<AppointmentExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForPendingRatings = useCallback(async () => {
    console.log('🔍 Iniciando checkForPendingRatings');
    setLoading(true);
    setError(null);
    
    try {
      console.log('📥 Obteniendo appointments del usuario...');
      const appointments = await getAppointmentsByUser();
      console.log('📦 Appointments recibidos:', {
        count: appointments?.length ?? 0,
        data: appointments
      });
      
      if (!Array.isArray(appointments)) {
        console.warn('⚠️ appointments no es un array:', {
          type: typeof appointments,
          value: appointments
        });
        setPendingRatings([]);
        return;
      }
      
      console.log('🔍 Verificando calificaciones existentes...');
      const ratedAppointmentIds = await checkPendingRatings();
      console.log('✅ IDs de citas ya calificadas:', ratedAppointmentIds);
      
      const validRatedIds = Array.isArray(ratedAppointmentIds) ? ratedAppointmentIds : [];
      console.log('🔄 IDs válidos de calificaciones:', validRatedIds);
      
      console.log('🔍 Filtrando appointments calificables...');
      const ratableAppointments = appointments.filter(appointment => {
        try {
          if (isNaN(appointment.appointmentId)) {
            console.log('⚠️ Appointment con ID inválido:', appointment);
            return false;
          }

          const appointmentDateTime = moment(`${appointment.appointmentDate} ${appointment.appointmentTime}`, 'YYYY-MM-DD HH:mm');
          const now = moment();
          
          const normalizedState = appointment.estado.toLowerCase();
          const isPaidOrConfirmed = normalizedState === 'pagado' || normalizedState === 'confirmado';
          const isInPast = appointmentDateTime.isBefore(now);
          const isNotRated = !validRatedIds.includes(appointment.appointmentId);

          console.log(`📊 Evaluando appointment ${appointment.appointmentId}:`, {
            fecha: `${appointment.appointmentDate} ${appointment.appointmentTime}`,
            fechaParsed: appointmentDateTime.format('YYYY-MM-DD HH:mm'),
            ahora: now.format('YYYY-MM-DD HH:mm'),
            estado: appointment.estado,
            estadoNormalizado: normalizedState,
            isPaidOrConfirmed,
            isInPast,
            isNotRated,
            diferenciaTiempo: appointmentDateTime.fromNow()
          });
          
          return isPaidOrConfirmed && isInPast && isNotRated;
        } catch (dateError) {
          console.error('❌ Error procesando fecha para appointment:', {
            appointmentId: appointment.appointmentId,
            date: appointment.appointmentDate,
            time: appointment.appointmentTime,
            error: dateError
          });
          return false;
        }
      });

      console.log('📝 Appointments calificables encontrados:', ratableAppointments.length);
      
      const extendedAppointments: AppointmentExtended[] = ratableAppointments.map(appointment => ({
        ...appointment,
        hasCourtRating: false,
        canBeRated: true,
      }));

      console.log('✨ Actualizando estado con appointments calificables:', extendedAppointments);
      setPendingRatings(extendedAppointments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar calificaciones pendientes';
      console.error('❌ Error en checkForPendingRatings:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(errorMessage);
      setPendingRatings([]);
    } finally {
      setLoading(false);
      console.log('🏁 Finalizado checkForPendingRatings');
    }
  }, []);

  useEffect(() => {
    console.log('🔄 Ejecutando efecto inicial de checkForPendingRatings');
    checkForPendingRatings();
  }, [checkForPendingRatings]);

  const markAsRated = useCallback((appointmentId: number) => {
    console.log('✍️ Marcando appointment como calificado:', appointmentId);
    setPendingRatings(prev => 
      prev.filter(appointment => appointment.appointmentId !== appointmentId)
    );
  }, []);

  return {
    pendingRatings,
    loading,
    error,
    refreshPendingRatings: checkForPendingRatings,
    markAsRated,
    hasPendingRatings: pendingRatings.length > 0,
  };
}; 