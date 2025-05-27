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
}

export interface Cancha {
  id: string;
  nombre: string;
  tipo: string | null;
  tipoSuperficie: string | null;
  imagenUrl: string | null;
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
  ultimoMantenimiento: string | null;
  createdAt: string;
}

export interface CanchaFormData {
  nombre: string;
  tipo: string;
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