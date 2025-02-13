import { api } from './api';

interface MercadoPagoPreference {
  predioId: string;
  items: {
    title: string;
    description: string;
    picture_url?: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
  }[];
  external_reference?: string;
}

export const mercadoPagoApi = {
  createPreference: async (data: MercadoPagoPreference) => {
    const response = await api.post('/mercadopago/create-preference', data);
    return response.data;
  },

  getPublicKey: async (predioId: string) => {
    const response = await api.get(`/mercadopago/public-key/${predioId}`);
    return response.data;
  },

  saveConfig: async (config: {
    predioId: string;
    accessToken: string;
    publicKey: string;
    isTestMode?: boolean;
  }) => {
    const response = await api.post('/mercadopago/config', config);
    return response.data;
  },

  getPaymentInfo: async (paymentId: string, predioId: string) => {
    const response = await api.get(`/mercadopago/payment/${paymentId}/${predioId}`);
    return response.data;
  }
}; 