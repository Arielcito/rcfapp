import type React from "react";

interface DataStatsOneProps {
  totalCanchas: number;
  totalReservas: number;
  ingresosTotales: number;
}

const DataStatsOne: React.FC<DataStatsOneProps> = ({
  totalCanchas,
  totalReservas,
  ingresosTotales
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
          <svg
            className="fill-primary"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Ícono de cancha"
          >
            <path
              d="M7 19H15M7 19V16M7 19H4.2C3.0799 19 2.51984 19 2.09202 18.782C1.71569 18.5903 1.40973 18.2843 1.21799 17.908C1 17.4802 1 16.9201 1 15.8V5.2C1 4.0799 1 3.51984 1.21799 3.09202C1.40973 2.71569 1.71569 2.40973 2.09202 2.21799C2.51984 2 3.0799 2 4.2 2H17.8C18.9201 2 19.4802 2 19.908 2.21799C20.2843 2.40973 20.5903 2.71569 20.782 3.09202C21 3.51984 21 4.0799 21 5.2V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H15M7 19H15M15 19V16M7 16V12M7 16H15M15 16V12M7 12V9H15V12M7 12H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black">
              {totalCanchas}
            </h4>
            <span className="text-sm font-medium">Total Canchas</span>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
          <svg
            className="fill-primary"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Ícono de calendario"
          >
            <path
              d="M16 2V6M6 2V6M2 8H20M4 3H18C19.1046 3 20 3.89543 20 5V19C20 20.1046 19.1046 21 18 21H4C2.89543 21 2 20.1046 2 19V5C2 3.89543 2.89543 3 4 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black">
              {totalReservas}
            </h4>
            <span className="text-sm font-medium">Total Reservas</span>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
          <svg
            className="fill-primary"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Ícono de dinero"
          >
            <path
              d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black">
              ${ingresosTotales}
            </h4>
            <span className="text-sm font-medium">Ingresos Totales</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataStatsOne;
