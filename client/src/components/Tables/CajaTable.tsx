"use client";

import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DateRangePicker from "@/components/DateRangePicker";
import AddMovimientoModal from '@/components/Caja/AddMovimientoModal';
import { usePredio } from "@/hooks/usePredio";

interface CajaMovimiento {
  id: string;
  concepto: string;
  jugador: string;
  usuario: string;
  cancha: string;
  fechaTurno: Date;
  fechaMovimiento: Date;
  metodoPago: string;
  egreso: number | null;
  ingreso: number | null;
}

interface CajaTableProps {
  predioId: string;
}

// Agregar tipo para los filtros
type DateFilter = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'custom';

const CajaTable = () => {
  const { predioId, isLoading: isPredioLoading } = usePredio();
  const [movimientos, setMovimientos] = useState<CajaMovimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(),
    to: new Date(),
  });
  const [totalIngreso, setTotalIngreso] = useState(0);
  const [totalEgreso, setTotalEgreso] = useState(0);
  const [activeFilter, setActiveFilter] = useState<DateFilter>('today');
  const [showAddModal, setShowAddModal] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (predioId) {
      fetchMovimientos();
    }
  }, [predioId, dateRange]);
  
  const fetchMovimientos = async () => {
    if (!predioId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/caja?predioId=${predioId}&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
      );
      const data = await response.json();
      
      // Verificar que data.movimientos existe
      const movimientosData = data.movimientos || [];
      setMovimientos(movimientosData);
      
      // Calcular totales con el array verificado
      const ingresos = movimientosData.reduce((acc: number, mov: CajaMovimiento) => 
        acc + (mov.ingreso || 0), 0
      );
      const egresos = movimientosData.reduce((acc: number, mov: CajaMovimiento) => 
        acc + (mov.egreso || 0), 0
      );
      
      setTotalIngreso(ingresos);
      setTotalEgreso(egresos);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching movimientos:', error);
      setMovimientos([]); // Establecer un array vacío en caso de error
      setTotalIngreso(0);
      setTotalEgreso(0);
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  // Agregar función para manejar los filtros
  const handleFilterClick = (filter: DateFilter) => {
    setActiveFilter(filter);
    const today = new Date();
    const fromDate = new Date();
    let toDate = new Date();

    switch (filter) {
      case 'today':
        // Mantener las fechas como están
        break;
      case 'yesterday':
        fromDate.setDate(today.getDate() - 1);
        toDate = new Date(fromDate);
        break;
      case 'thisWeek':
        fromDate.setDate(today.getDate() - today.getDay());
        break;
      case 'thisMonth':
        fromDate.setDate(1);
        break;
    }

    setDateRange({ from: fromDate, to: toDate });
  };

  const handleAddMovimiento = async (movimientoData: CajaMovimiento) => {
    try {
      const response = await fetch('/api/caja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimientoData),
      });

      if (response.ok) {
        fetchMovimientos(); // Recargar los movimientos
      } else {
        console.error('Error al crear movimiento');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isPredioLoading) {
    return <div>Cargando información del predio...</div>;
  }

  if (!predioId) {
    return <div>No se encontró ningún predio asociado</div>;
  }

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white mb-4 sm:mb-0">
            Reporte de caja
          </h4>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-sm"
            >
              Agregar Movimiento
            </button>
            <div className="flex gap-2">
              {[
                { id: 'today', label: 'Hoy' },
                { id: 'yesterday', label: 'Ayer' },
                { id: 'thisWeek', label: 'Esta semana' },
                { id: 'thisMonth', label: 'Este mes' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => handleFilterClick(id as DateFilter)}
                  className={`px-3 py-1 rounded ${
                    activeFilter === id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <div className="text-right">
                <span className="block text-sm text-meta-3">Total Ingresos</span>
                <span className="block text-2xl font-medium text-meta-3">
                  {formatCurrency(totalIngreso)}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-sm text-meta-1">Total Egresos</span>
                <span className="block text-2xl font-medium text-meta-1">
                  {formatCurrency(totalEgreso)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Concepto
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Jugador
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Usuario
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Cancha
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Fecha de turno
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Fecha movimiento
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Método de pago
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Egreso
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Ingreso
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    No hay movimientos para el período seleccionado
                  </td>
                </tr>
              ) : (
                movimientos.map((item) => (
                  <tr key={item.id}>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {item.concepto}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.jugador}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.usuario}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.cancha}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {format(new Date(item.fechaTurno), 'dd/MM/yy HH:mm', { locale: es })}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {format(new Date(item.fechaMovimiento), 'dd/MM/yy HH:mm', { locale: es })}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.metodoPago}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-meta-1">{formatCurrency(item.egreso)}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-meta-3">{formatCurrency(item.ingreso)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddMovimientoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddMovimiento}
        predioId={predioId || ""}
      />
    </>
  );
};

export default CajaTable;
