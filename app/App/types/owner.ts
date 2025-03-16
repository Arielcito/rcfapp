import { Booking } from './booking';

export interface ChartDataPoint {
  x: string;
  y: number;
}

export type ReservaResponse = Booking[] | { data: Booking[] };

export interface ContactInfo {
  tipo: 'telefono' | 'email';
  valor: string;
}

export interface OwnerHomeScreenState {
  loading: boolean;
  reservas: Booking[];
  chartData: ChartDataPoint[] | null;
  userName: string;
  selectedReserva: Booking | null;
  modalVisible: boolean;
} 