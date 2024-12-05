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

export interface PredioCreationData {
  usuarioId: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal?: string;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  capacidadEstacionamiento?: number;
  tieneVestuarios?: boolean;
  tieneCafeteria?: boolean;
  horarioApertura?: string;
  horarioCierre?: string;
  diasOperacion?: string;
  imagenUrl?: string;
}

export interface PredioUpdateData extends Partial<PredioCreationData> {}