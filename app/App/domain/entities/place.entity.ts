export interface Place {
    description: string;      // Cadena que describe el lugar, por ejemplo, "Cancha de fútbol 5"
    direccion: string;        // Cadena que representa la dirección del lugar
    horarioApertura: number;  // Número que representa la hora de apertura
    horarioCierre: number;    // Número que representa la hora de cierre
    id: number;               // Número que representa el ID del lugar
    id_duenio: string;        // Cadena que representa el ID del dueño
    imageUrl: string;         // Cadena que representa la URL de la imagen
    latitude: number;         // Número que representa la latitud del lugar
    longitude: number;        // Número que representa la longitud del lugar
    name: string;             // Cadena que representa el nombre del lugar
    telefono: number;         // Número que representa el teléfono de contacto
  }
  