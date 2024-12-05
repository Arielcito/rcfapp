"use client";
import { ApexOptions } from "apexcharts";
import React from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartTwoProps {
  data: Array<{estadoPago: string; _count: number}>;
}

const ChartTwo: React.FC<ChartTwoProps> = ({ data }) => {
  const options: ApexOptions = {
    chart: {
      type: "donut",
    },
    colors: ["#3C50E0", "#80CAEE", "#F7C32E", "#FF6B6B"],
    labels: data.map(item => item.estadoPago || "Sin estado"),
    legend: {
      show: true,
      position: "bottom",
    },
    title: {
      text: "Reservas por Estado de Pago",
      align: "center"
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: true,
    },
  };

  const series = data.map(item => item._count);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Estado de Pagos
          </h5>
        </div>
      </div>

      <div className="mb-2">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={350}
        />
      </div>
    </div>
  );
};

export default ChartTwo;
