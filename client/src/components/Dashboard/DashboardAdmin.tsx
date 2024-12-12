"use client";
import { useEffect, useState } from "react";
import ChartTwo from "../Charts/ChartTwo";
import TableOne from "../Tables/TableOne";
import DataStatsOne from "@/components/DataStats/DataStatsOne";
import ChartOne from "@/components/Charts/ChartOne";
import { Skeleton } from "@/components/ui/skeleton";
import { usePredio } from "@/hooks/usePredio";
import { ProximasAgendas } from "../proximas-agendas";
import { ResumenSemana } from "../resumen-semana";
import { GraficoDineroGanado } from "../grafico-dinero-ganado";

interface DashboardStats {
  totalCanchas: number;
  totalReservas: number;
  ingresosTotales: number;
  reservasPorMes: Array<{mes: string; total: number}>;
  reservasPorEstado: Array<{estadoPago: string; _count: number}>;
  canchasMasReservadas: Array<{canchaId: string; _count: number}>;
  proximasReservas: Array<{
    id: string;
    fechaHora: string;
    estadoPago: string | null;
    user: {
      name: string | null;
      email: string | null;
    };
    cancha: {
      nombre: string;
    };
  }>;
}

const DashboardAdmin = () => {
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { predio } = usePredio();

  useEffect(() => {
    setIsClient(true);
    if (predio?.id) {
      fetchDashboardStats();
    }
  }, [predio]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?predioId=${predio?.id}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="flex-1 space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <ProximasAgendas />
          <ResumenSemana />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <GraficoDineroGanado />
        </div>
      </div>
    </>
  );
};

export default DashboardAdmin;
