import type { Appointment } from "../../domain/entities/appointment.entity";
import { api } from "./api";

const HORARIOS_DISPONIBLES = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

export const getAppointmentsByDate = async (
  selectedDate: Date | null,
  selectedTime: string | null
): Promise<Appointment[]> => {
  try {
    if (!selectedDate || !selectedTime) {
      return [];
    }
    
    const { data } = await api.post('/reservas/availability', {
      canchaId: 1,
      fechaHora: selectedDate,
      duracion: selectedTime
    });

    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching appointments: ", error);
    return [];
  }
};

export const getAppointmentsByAppointmentDate = async (
  date: Date
): Promise<Appointment[]> => {
  try {
    const { data } = await api.get(`/reservas/date/${date.toISOString()}`);
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching appointments: ", error);
    return [];
  }
};

export const getAppointmentById = async (
  appointmentId: number
): Promise<Appointment[]> => {
  try {
    const { data } = await api.get(`/reservas/${appointmentId}`);
    return data.success ? [data.data] : [];
  } catch (error) {
    console.error("Error fetching appointment: ", error);
    return [];
  }
};

export const getAppointmentsByUser = async (
  email: string
): Promise<Appointment[]> => {
  try {
    const { data } = await api.get(`/reservas/user/${email}`);
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching appointments: ", error);
    return [];
  }
};

export const getAvailableTimes = async (fecha: string): Promise<string[]> => {
  try {
    const { data } = await api.post('/reservas/available-times', { fecha });
    if (!data.success) return [];

    const horariosOcupados = data.data.reservedTimes || [];
    return HORARIOS_DISPONIBLES.filter(
      horario => !horariosOcupados.includes(horario)
    );
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    return [];
  }
};

