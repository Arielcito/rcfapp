import { api } from './api';

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

export const FinanceService = {
  async getMovimientos(predioId: string): Promise<FinanceEntry[]> {
    const response = await api.get(`/movimientos/predio/${predioId}`);
    return response.data;
  },

  async createMovimiento(predioId: string, movimiento: Omit<FinanceEntry, 'id' | 'date'>): Promise<FinanceEntry> {
    const response = await api.post(`/movimientos/predio/${predioId}`, movimiento);
    return response.data;
  },

  async updateMovimiento(id: string, movimiento: Partial<FinanceEntry>): Promise<FinanceEntry> {
    const response = await api.put(`/movimientos/${id}`, movimiento);
    return response.data;
  },

  async deleteMovimiento(id: string): Promise<void> {
    await api.delete(`/movimientos/${id}`);
  },

  async getResumenMovimientos(predioId: string): Promise<FinanceSummary> {
    const response = await api.get(`/movimientos/predio/${predioId}/resumen`);
    return response.data;
  },

  async getCategorias(): Promise<FinanceCategory[]> {
    const response = await api.get('/movimientos/categorias');
    return response.data;
  }
}; 