"use client";

import { useState } from 'react';

interface AddMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (movimientoData: any) => void;
  predioId: string;
}

const AddMovimientoModal = ({ isOpen, onClose, onSubmit, predioId }: AddMovimientoModalProps) => {
  const [formData, setFormData] = useState({
    concepto: '',
    descripcion: '',
    monto: 0,
    tipo: 'INGRESO', // INGRESO o EGRESO
    metodoPago: 'EFECTIVO',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      predioId,
      monto: Number(formData.monto),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 w-full">
        <div className="bg-white dark:bg-boxdark p-8 rounded-sm max-w-md w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-white dark:bg-boxdark py-2">
            Agregar Movimiento Manual
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="concepto" className="block text-sm font-medium mb-1">
                Concepto
              </label>
              <input
                type="text"
                id="concepto"
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="tipo" className="block text-sm font-medium mb-1">
                Tipo de Movimiento
              </label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                required
              >
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="monto" className="block text-sm font-medium mb-1">
                Monto
              </label>
              <input
                type="number"
                id="monto"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="metodoPago" className="block text-sm font-medium mb-1">
                Método de Pago
              </label>
              <select
                id="metodoPago"
                value={formData.metodoPago}
                onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                required
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-body text-white px-4 py-2 rounded-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-sm"
              >
                Agregar Movimiento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMovimientoModal; 