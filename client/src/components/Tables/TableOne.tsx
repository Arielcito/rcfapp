import { formatDate } from "date-fns";

interface Reserva {
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
}

interface TableOneProps {
  proximasReservas: Reserva[];
}

const TableOne: React.FC<TableOneProps> = ({ proximasReservas }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Próximas Reservas
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Cliente
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Cancha
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Fecha
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Hora
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Estado
            </h5>
          </div>
        </div>

        {proximasReservas.map((reserva, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === proximasReservas.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={reserva.id}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="hidden text-black dark:text-white sm:block">
                {reserva.user.name || reserva.user.email}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{reserva.cancha.nombre}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">
                {formatDate(new Date(reserva.fechaHora), "dd/MM/yyyy")}
              </p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">
                {formatDate(new Date(reserva.fechaHora), "HH:mm")}
              </p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className={`${getStatusColor(reserva.estadoPago)} rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium`}>
                {reserva.estadoPago || "Pendiente"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStatusColor = (status: string | null): string => {
  switch (status?.toLowerCase()) {
    case 'pagado':
      return 'text-success bg-success';
    case 'pendiente':
      return 'text-warning bg-warning';
    case 'cancelado':
      return 'text-danger bg-danger';
    default:
      return 'text-warning bg-warning';
  }
};

export default TableOne;
