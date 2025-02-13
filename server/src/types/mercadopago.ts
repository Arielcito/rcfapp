export interface MercadoPagoConfigDTO {
  predioId: string;
  accessToken: string;
  publicKey: string;
  isTestMode?: boolean;
}

export interface PreferenceItem {
  title: string;
  description: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
}

export interface CreatePreferenceDTO {
  predioId: string;
  items: PreferenceItem[];
  external_reference?: string;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: string;
  notification_url?: string;
} 