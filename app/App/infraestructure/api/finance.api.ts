import { api } from './api';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export interface FinanceEntry {
  id: string;
  tipo: 'INGRESO' | 'EGRESO';
  concepto: string;
  descripcion?: string;
  monto: number;
  fechaMovimiento: string;
  predioId: string;
  categoriaId: string;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO' | 'MERCADO_PAGO' | 'OTRO';
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

const handleApiError = (error: AxiosError<ErrorResponse>): ApiError => {
  console.error('[FinanceService] API Error:', {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message,
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString()
  });

  if (error.response?.data) {
    return {
      message: error.response.data.message || `Error: ${error.message}`,
      code: error.response.data.code,
      details: error.response.data.details
    };
  }

  return {
    message: `Error de conexión: ${error.message}`,
    code: 'NETWORK_ERROR'
  };
};

export const FinanceService = {
  async getMovimientos(predioId: string): Promise<FinanceEntry[]> {
    try {
      console.log(`[FinanceService] Fetching movements for predio: ${predioId}`);
      const fullUrl = `${api.defaults.baseURL}/movimientos/${predioId}`;
      console.log(`[FinanceService] Full request URL: ${fullUrl}`);
      const response = await api.get(`/movimientos/${predioId}`);
      console.log(`[FinanceService] Successfully fetched movements for predio: ${predioId}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError<ErrorResponse>);
      console.error(`[FinanceService] Error fetching movements for predio ${predioId}:`, apiError);
      throw apiError;
    }
  },

  async createMovimiento(predioId: string, movimiento: Omit<FinanceEntry, 'id' | 'fechaMovimiento'>): Promise<FinanceEntry> {
    try {
      console.log(`[FinanceService] Creating movement for predio: ${predioId}`, movimiento);
      const response = await api.post(`/predios/${predioId}/movimientos`, movimiento);
      console.log(`[FinanceService] Successfully created movement for predio: ${predioId}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError<ErrorResponse>);
      console.error(`[FinanceService] Error creating movement for predio ${predioId}:`, apiError);
      throw apiError;
    }
  },

  async updateMovimiento(id: string, movimiento: Partial<FinanceEntry>): Promise<FinanceEntry> {
    try {
      console.log(`[FinanceService] Updating movement with id: ${id}`, movimiento);
      const response = await api.put(`/movimientos/${id}`, movimiento);
      console.log(`[FinanceService] Successfully updated movement with id: ${id}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError<ErrorResponse>);
      console.error(`[FinanceService] Error updating movement with id ${id}:`, apiError);
      throw apiError;
    }
  },

  async deleteMovimiento(id: string): Promise<void> {
    try {
      console.log(`[FinanceService] Deleting movement with id: ${id}`);
      await api.delete(`/movimientos/${id}`);
      console.log(`[FinanceService] Successfully deleted movement with id: ${id}`);
    } catch (error) {
      const apiError = handleApiError(error as AxiosError<ErrorResponse>);
      console.error(`[FinanceService] Error deleting movement with id ${id}:`, apiError);
      throw apiError;
    }
  },

  async getResumenMovimientos(predioId: string): Promise<FinanceSummary> {
    try {
      console.log(`[FinanceService] Fetching summary for predio: ${predioId}`);
      const response = await api.get(`/predios/${predioId}/movimientos/resumen`);
      console.log(`[FinanceService] Successfully fetched summary for predio: ${predioId}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError<ErrorResponse>);
      console.error(`[FinanceService] Error fetching summary for predio ${predioId}:`, apiError);
      throw apiError;
    }
  },

  async getCategorias(): Promise<FinanceCategory[]> {
    try {
      console.log('[FinanceService] Fetching categories');
      const response = await api.get('/movimientos/categorias');
      console.log('[FinanceService] Successfully fetched categories');
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError<ErrorResponse>);
      console.error('[FinanceService] Error fetching categories:', apiError);
      throw apiError;
    }
  }
}; 