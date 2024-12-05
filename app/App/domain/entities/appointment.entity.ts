export interface Appointment {
    appointmentDate: string;    // Cadena que representa la fecha de la cita, por ejemplo, "2024-08-21"
    appointmentTime: string;    // Cadena que representa la hora de la cita, por ejemplo, "12:00"
    email: string;              // Cadena que representa el correo electrónico del usuario
    estado: string;             // Cadena que representa el estado de la cita, por ejemplo, "Reservado"
    appointmentId: number;      // Número que representa el ID de la cita
    pitch: number;             // Número que representa el ID de la cancha
  }
  