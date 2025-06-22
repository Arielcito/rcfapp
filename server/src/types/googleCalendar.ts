export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface GoogleCalendarAuthResponse {
  authUrl: string;
}

export interface GoogleCalendarCallbackRequest {
  code: string;
}

export interface GoogleCalendarConnectionStatus {
  status: boolean;
  isConnected: boolean;
  message: string;
}

export interface ReservationEventData {
  canchaName: string;
  predioName: string;
  fechaHora: Date;
  duracion: number;
  precioTotal: number;
  direccion: string;
  clienteName?: string;
}

export interface GoogleCalendarServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
} 