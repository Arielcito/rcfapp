"use client";

import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CajaTable from "@/components/Tables/CajaTable";
import { usePredio } from "@/hooks/usePredio";

const DEMO_CAJA_DATA = {
  movimientos: [
    {
      id: '1',
      fecha: new Date('2024-03-20T10:30:00'),
      tipo: 'INGRESO' as const,
      concepto: 'Reserva Cancha F5 - A',
      monto: 25000,
      metodoPago: 'EFECTIVO' as const,
      comprobante: '#REF001'
    },
    {
      id: '2',
      fecha: new Date('2024-03-20T15:15:00'),
      tipo: 'INGRESO' as const,
      concepto: 'Reserva Cancha F7',
      monto: 35000,
      metodoPago: 'TRANSFERENCIA' as const,
      comprobante: '#REF002'
    },
    {
      id: '3',
      fecha: new Date('2024-03-20T16:00:00'),
      tipo: 'EGRESO' as const,
      concepto: 'Mantenimiento Césped',
      monto: -15000,
      metodoPago: 'EFECTIVO' as const,
      comprobante: '#GAS001'
    },
    {
      id: '4',
      fecha: new Date('2024-03-20T18:30:00'),
      tipo: 'INGRESO' as const,
      concepto: 'Reserva Cancha F11',
      monto: 45000,
      metodoPago: 'TARJETA' as const,
      comprobante: '#REF003'
    },
    {
      id: '5',
      fecha: new Date('2024-03-20T20:00:00'),
      tipo: 'EGRESO' as const,
      concepto: 'Pago Personal',
      monto: -20000,
      metodoPago: 'TRANSFERENCIA' as const,
      comprobante: '#GAS002'
    }
  ],
  resumen: {
    ingresos: 105000,
    egresos: -35000,
    saldoTotal: 70000
  }
};

const CajaPage = () => {
  const { predio } = usePredio();

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Reporte de caja" />
      <div className="flex flex-col gap-10">
        <CajaTable 
          initialData={DEMO_CAJA_DATA} 
          predioId={predio?.id || ''}
        />
      </div>
    </div>
  );
};

export default CajaPage; 