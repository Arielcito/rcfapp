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
  predio: {
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

export interface CanchaCreationData {
  nombre: string;
  predioId: string;
  deporteId: string;
  tipo?: string;
  tipoSuperficie?: string;
  capacidadJugadores?: number;
  longitud?: number | string;
  ancho?: number | string;
  tieneIluminacion?: boolean;
  esTechada?: boolean;
  precioPorHora?: number | string;
  estado?: string;
  equipamientoIncluido?: string;
  requiereSeña?: boolean;
  montoSeña?: number;
}

export interface CanchaUpdateData extends Partial<CanchaCreationData> {}