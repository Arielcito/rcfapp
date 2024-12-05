export interface Cancha {
  id: string;
  predioId: string | null;
  nombre: string;
  tipo: string | null;
  capacidadJugadores: number | null;
  longitud: string | null;
  ancho: string | null;
  tipoSuperficie: string | null;
  techado: boolean | null;
  iluminacion: boolean | null;
  cesped: boolean | null;
  createdAt: Date | null;
}

export interface CanchaCreationData {
  predioId?: string | null;
  nombre: string;
  tipo?: string | null;
  capacidadJugadores?: number | null;
  longitud?: string | null;
  ancho?: string | null;
  tipoSuperficie?: string | null;
  techado?: boolean | null;
  iluminacion?: boolean | null;
  cesped?: boolean | null;
}

export interface CanchaUpdateData extends Partial<CanchaCreationData> {}