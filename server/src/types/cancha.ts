export interface Cancha {
  id: string;
  predioId: string | null;
  nombre: string;
  tipo: string | null;
  capacidadJugadores: number | null;
  longitud: string | null;
  ancho: string | null;
  tipoSuperficie: string | null;
  tieneIluminacion: boolean | null;
  esTechada: boolean | null;
  precioPorHora: number | null;
  estado: string | null;
  ultimoMantenimiento: Date | null;
  equipamientoIncluido: string | null;
  imagenUrl: string | null;
  createdAt: Date | null;
  requiereSeña: boolean;
  montoSeña: number;
}

export interface CanchaCreationData {
  predioId?: string | null;
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