export interface Horario {
  id: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Predio {
  id: string;
  usuarioId: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal?: string;
  telefono?: string;
  email?: string;
  cbu?: string;
  titularCuenta?: string;
  tipoCuenta?: string;
  banco?: string;
  numeroCuenta?: string;
  latitud?: number;
  longitud?: number;
  capacidadEstacionamiento?: number;
  tieneVestuarios?: boolean;
  tieneCafeteria?: boolean;
  horarioApertura?: string;
  horarioCierre?: string;
  diasOperacion?: string;
  imagenUrl?: string;
  fechaRegistro?: Date;
  horarios?: Horario[];
  servicios?: Servicio[];
}

export interface Cancha {
  id: string;
  nombre: string;
  tipo: string;
  tipoSuperficie: string;
  imagenUrl?: string | null;
  ancho: number | null;
  longitud: number | null;
  capacidadJugadores: number | null;
  equipamientoIncluido: string | null;
  esTechada: boolean;
  estado: string | null;
  montoSeña: number;
  precioPorHora: string;
  predioId: string;
  requiereSeña: boolean;
  tieneIluminacion: boolean;
  ultimoMantenimiento?: string | null;
  createdAt?: string;
  deporteId?: string;
}

export interface CanchaFormData {
  nombre: string;
  tipo: string;
  deporteId: string;
  tipoSuperficie: string;
  capacidadJugadores: number;
  longitud: number;
  ancho: number;
  tieneIluminacion: boolean;
  esTechada: boolean;
  precioPorHora: number;
  estado: string;
  equipamientoIncluido: string;
  requiereSeña: boolean;
  montoSeña: number;
}

export interface Cancha extends CanchaFormData {
  id: string;
  predioId: string;
  imagenUrl?: string | null;
  ultimoMantenimiento?: string | null;
  createdAt?: string | null;
  predio?: {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
  };
  deporte?: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
}

export interface PredioFormData {
  nombre: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  telefono: string;
  email: string;
  capacidadEstacionamiento: number;
  tieneVestuarios: boolean;
  tieneCafeteria: boolean;
  horarioApertura: string;
  horarioCierre: string;
} 