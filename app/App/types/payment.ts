import { Cancha, Predio } from './booking';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'Mercado Pago';

export interface CreditCardData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export interface PaymentScreenParams {
  selectedDate: moment.Moment;
  selectedTime: string;
  appointmentData: {
    place: Predio & {
      direccion?: string;
      cbu?: string;
      titularCuenta?: string;
      banco?: string;
      tipoCuenta?: string;
      imagenUrl?: string;
    };
    cancha: Cancha & {
      precioPorHora: number;
      requiereSeña?: boolean;
      montoSeña?: number;
      longitud?: number;
      ancho?: number;
      numero?: number;
      caracteristicas?: string[];
    };
  };
}

export interface ReservaData {
  canchaId: string;
  userId: string;
  fechaHora: string;
  duracion: number;
  precioTotal: number;
  metodoPago: string;
  estadoPago: string;
  notasAdicionales?: string;
}

export interface MercadoPagoItem {
  title: string;
  description: string;
  picture_url?: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
}

export interface MercadoPagoPreferenceData {
  predioId: string;
  items: MercadoPagoItem[];
  external_reference: string;
} 