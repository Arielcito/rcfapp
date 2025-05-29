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
}

export interface CanchaCreationData {
  predioId: string;
  nombre: string;
  tipo?: string | null;
  capacidadJugadores?: number | null;
  longitud?: string | null;
  ancho?: string | null;
  tipoSuperficie?: string | null;
  tieneIluminacion?: boolean | null;
  esTechada?: boolean | null;
  precioPorHora?: number | null;
  estado?: string | null;
  ultimoMantenimiento?: Date | null;
  equipamientoIncluido?: string | null;
  imagenUrl?: string | null;
  requiereSeña?: boolean;
  montoSeña?: number;
}

export interface CanchaUpdateData extends Partial<CanchaCreationData> {}