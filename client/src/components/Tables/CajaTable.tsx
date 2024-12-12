"use client";

import { useState } from 'react';
import AddMovimientoModal from '../Caja/AddMovimientoModal';

interface Movimiento {
  id: string;
  fecha: Date;
  tipo: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
  comprobante: string;
}

interface ResumenCaja {
  ingresos: number;
  egresos: number;
  saldoTotal: number;
}

interface CajaTableProps {
  initialData: {
    movimientos: Movimiento[];
    resumen: ResumenCaja;
  };
  predioId: string;
}

const CajaTable = ({ initialData, predioId }: CajaTableProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [movimientos, setMovimientos] = useState<Movimiento[]>(initialData.movimientos);
  const [resumen, setResumen] = useState<ResumenCaja>(initialData.resumen);

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha);
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white">
              Movimientos de Caja
            </h3>
            <p className="text-sm text-gray-500">
              Saldo actual: {formatMonto(resumen.saldoTotal)}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-sm bg-primary py-2 px-6 text-white hover:bg-opacity-90"
          >
            Nuevo Movimiento
          </button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Fecha
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Concepto
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Tipo
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Método
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Monto
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Comprobante
                </th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {formatFecha(movimiento.fecha)}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {movimiento.concepto}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <span
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                        movimiento.tipo === 'INGRESO'
                          ? 'bg-success text-success'
                          : 'bg-danger text-danger'
                      }`}
                    >
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {movimiento.metodoPago}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <span
                      className={
                        movimiento.tipo === 'INGRESO'
                          ? 'text-success'
                          : 'text-danger'
                      }
                    >
                      {formatMonto(movimiento.monto)}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {movimiento.comprobante}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-sm border border-stroke bg-white p-4">
            <h4 className="text-sm font-medium text-black dark:text-white">
              Total Ingresos
            </h4>
            <p className="text-xl font-bold text-success">
              {formatMonto(resumen.ingresos)}
            </p>
          </div>
          <div className="rounded-sm border border-stroke bg-white p-4">
            <h4 className="text-sm font-medium text-black dark:text-white">
              Total Egresos
            </h4>
            <p className="text-xl font-bold text-danger">
              {formatMonto(Math.abs(resumen.egresos))}
            </p>
          </div>
          <div className="rounded-sm border border-stroke bg-white p-4">
            <h4 className="text-sm font-medium text-black dark:text-white">
              Saldo Total
            </h4>
            <p className={`text-xl font-bold ${resumen.saldoTotal >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatMonto(resumen.saldoTotal)}
            </p>
          </div>
        </div>
      </div>

      <AddMovimientoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(data) => {
          console.log(data);
          setShowAddModal(false);
        }}
        predioId={predioId}
      />
    </>
  );
};

export default CajaTable;
