import type { Appointment } from "../../domain/entities/appointment.entity";
import { api } from "./api";

const HORARIOS_DISPONIBLES = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

interface ApiAppointment {
  appointmentId: string | number;
  place: {
    name: string;
    description: string;
    imageUrl?: string;
    telefono: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  estado: string;
  metodoPago: string;
}

export const createAppointment = async (appointmentData: {
  canchaId: string;
  userId: string;
  fechaHora: Date;
  duracion: number;
  precioTotal?: number;
  metodoPago?: string;
  notasAdicionales?: string;
}): Promise<Appointment | undefined> => {
  try {
    const { data } = await api.post('/reservas', appointmentData);
    return data.success ? data.data : undefined;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

export const getAppointmentById = async (
  appointmentId: string
): Promise<Appointment | undefined> => {
  try {
    const { data } = await api.get(`/reservas/${appointmentId}`);
    return data.success ? data.data : undefined;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw error;
  }
};

export const updateAppointment = async (
  appointmentId: string,
  updateData: Partial<Appointment>
): Promise<Appointment | undefined> => {
  try {
    const { data } = await api.put(`/reservas/${appointmentId}`, updateData);
    return data.success ? data.data : undefined;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

export const checkAppointmentAvailability = async (
  canchaId: string,
  fechaHora: Date,
  duracion: number
): Promise<boolean> => {
  try {
    const { data } = await api.post('/reservas/check', {
      canchaId,
      fechaHora,
      duracion
    });
    return data.success ? data.data.disponible : false;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
};

export const getAvailableTimes = async (fecha: string): Promise<string[]> => {
  try {
   
    return HORARIOS_DISPONIBLES
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    return [];
  }
};

export const getAppointmentsByAppointmentDate = async (date: string): Promise<Appointment[]> => {
  try {
    const { data } = await api.get(`/reservas/owner/${date}`);
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error al obtener las reservas:", error);
    return [];
  }
};

export const getAppointmentsByUser = async (): Promise<Appointment[]> => {
  try {
    const response = await api.get('/reservas/user/bookings');
    const appointments = response.data as ApiAppointment[];

    return appointments.map((appointment: ApiAppointment) => ({
      appointmentId: typeof appointment.appointmentId === 'string' 
        ? Number.parseInt(appointment.appointmentId, 10) 
        : appointment.appointmentId,
      place: {
        ...appointment.place,
        imageUrl: appointment.place.imageUrl || 'https://example.com/placeholder.jpg'
      },
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      estado: appointment.estado,
      metodoPago: appointment.metodoPago,
      email: 'usuario@example.com',
      pitch: 1
    }));
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    return [];
  }
};


