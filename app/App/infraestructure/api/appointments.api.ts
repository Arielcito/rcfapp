import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { FIREBASE_DB } from "../config/FirebaseConfig";
import { Appointment } from "../../domain/entities/appointment.entity";
const db = FIREBASE_DB;

// Definimos los horarios disponibles del establecimiento (8:00 AM a 10:00 PM)
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
    
    const q = query(
      collection(db, "rfc-appointments-place"),
      where("appointmentDate", "==", selectedDate.toString()),
      where("appointmentTime", "==", selectedTime.toString()),
      where("estado", "in", ["reservado", "pendiente"])
    );

    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map((doc) => doc.data()) as Appointment[];
    
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments: ", error);
    return [];
  }
};

export const getAppointmentsByAppointmentDate = async (
  date: Date
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, "rfc-appointments-place"),
      where("cancha", "==", 1),
      where("appointmentDate", "==", date.toString())
    );

    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map((doc) => doc.data()) as Appointment[];
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments: ", error);
    return [];
  }
};

export const getAppointmentById = async (
  appointmentId: number
): Promise<Appointment[]> => {
  const q = query(
    collection(db, "rfc-appointments-place"),
    where("appointmentId", "==", appointmentId)
  );

  const querySnapshot = await getDocs(q);
  const appointments = querySnapshot.docs.map((doc) => doc.data()) as Appointment[];

  return appointments;
};

export const getAppointments = async (date: Date): Promise<Appointment[]> => {
  const q = query(
    collection(db, "rfc-appointments-place"),
    where("cancha", "==", 1),
    where("appointmentDate", "==", date.toString())
  );

  const querySnapshot = await getDocs(q);
  const appointments = querySnapshot.docs.map((doc) => doc.data()) as Appointment[];
  return appointments;
};

export const getAppointmentsByUser = async (
  email: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, "rfc-appointments-place"),
      orderBy("appointmentDate", "desc"),
      where("email", "==", email)
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map((doc) => doc.data()) as Appointment[];

    return appointments;
  } catch (error) {
    console.error("Error fetching appointments: ", error);
    return [];
  }
};

export const getAvailableTimes = async (fecha: string): Promise<string[]> => {
  try {
    // Convertimos la fecha string a objeto Date
    const fechaObj = new Date(fecha);
    
    // Obtenemos todas las citas para esa fecha
    const citasExistentes = await getAppointmentsByAppointmentDate(fechaObj);
    
    // Filtramos los horarios ocupados
    const horariosOcupados = citasExistentes
      .filter(cita => cita.estado === "reservado" || cita.estado === "pendiente")
      .map(cita => cita.appointmentTime);
    
    // Retornamos solo los horarios que no están ocupados
    const horariosDisponibles = HORARIOS_DISPONIBLES.filter(
      horario => !horariosOcupados.includes(horario)
    );
    
    return horariosDisponibles;
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    return [];
  }
};

