"use client"
import React, { useState, useEffect } from "react";
import Modal from "../Modal";

interface Predio {
  id: string;
  nombre: string;
  horarioApertura: string;
  horarioCierre: string;
}

interface Cancha {
  id: string;
  nombre: string;
  tipo: string | null;
  predioId: string;
}

interface User {
  name: string | null;
  email: string | null;
}

interface Reserva {
  id: string;
  fechaHora: string;
  duracion: number;
  estadoPago: string | null;
  user: User;
  cancha: {
    nombre: string;
    id: string;
  };
}

interface CalendarData {
  predio: Predio;
  canchas: Cancha[];
  reservas: Reserva[];
}

const DEMO_CALENDAR_DATA: CalendarData = {
  predio: {
    id: '1',
    nombre: 'Complejo Deportivo Norte',
    horarioApertura: '08:00:00',
    horarioCierre: '23:00:00'
  },
  canchas: [
    { id: '1', nombre: 'Cancha F5 - A', tipo: 'Fútbol 5', predioId: '1' },
    { id: '2', nombre: 'Cancha F5 - B', tipo: 'Fútbol 5', predioId: '1' },
    { id: '3', nombre: 'Cancha F7', tipo: 'Fútbol 7', predioId: '1' },
    { id: '4', nombre: 'Cancha F11', tipo: 'Fútbol 11', predioId: '1' }
  ],
  reservas: [
    {
      id: '1',
      fechaHora: new Date('2024-03-20T10:00:00').toISOString(),
      duracion: 2,
      estadoPago: 'PAGADO',
      user: { name: 'Juan Pérez', email: 'juan@ejemplo.com' },
      cancha: { id: '1', nombre: 'Cancha F5 - A' }
    },
    {
      id: '2',
      fechaHora: new Date('2024-03-20T15:00:00').toISOString(),
      duracion: 1,
      estadoPago: 'PENDIENTE',
      user: { name: 'María González', email: 'maria@ejemplo.com' },
      cancha: { id: '2', nombre: 'Cancha F5 - B' }
    },
    {
      id: '3',
      fechaHora: new Date('2024-03-20T18:00:00').toISOString(),
      duracion: 2,
      estadoPago: 'PAGADO',
      user: { name: 'Carlos Rodríguez', email: 'carlos@ejemplo.com' },
      cancha: { id: '3', nombre: 'Cancha F7' }
    },
    {
      id: '4',
      fechaHora: new Date('2024-03-20T20:00:00').toISOString(),
      duracion: 2,
      estadoPago: 'PAGADO',
      user: { name: 'Ana Silva', email: 'ana@ejemplo.com' },
      cancha: { id: '4', nombre: 'Cancha F11' }
    }
  ]
};

const CalendarBox = () => {
  const [selectedBooking, setSelectedBooking] = useState<Reserva | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [horarioApertura, setHorarioApertura] = useState(0);
  const [horarioCierre, setHorarioCierre] = useState(23);

  useEffect(() => {
    setCalendarData(DEMO_CALENDAR_DATA);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (calendarData?.predio) {
      try {
        const apertura = new Date(calendarData.predio.horarioApertura).getHours();
        const cierre = new Date(calendarData.predio.horarioCierre).getHours();
        
        if (Number.isNaN(apertura) || Number.isNaN(cierre)) {
          console.warn('Horarios inválidos, usando horario completo');
          setHorarioApertura(0);
          setHorarioCierre(23);
        } else {
          setHorarioApertura(apertura);
          setHorarioCierre(cierre === 0 ? 24 : cierre);
        }
      } catch (error) {
        console.warn('Error al procesar horarios, usando horario completo:', error);
        setHorarioApertura(0);
        setHorarioCierre(23);
      }
    }
  }, [calendarData]);

  const hours = Array.from(
    { length: horarioCierre - horarioApertura + 1 }, 
    (_, i) => i + horarioApertura
  );

  const getBookingStyle = (estadoPago: string | null) => {
    switch (estadoPago?.toLowerCase()) {
      case "pagado": return "bg-green-300 text-green-800";
      case "pendiente": return "bg-yellow-300 text-yellow-800";
      case "cancelado": return "bg-red-300 text-red-800";
      default: return "bg-gray-300 text-gray-800";
    }
  };

  const handleBookingClick = (reserva: Reserva) => {
    setSelectedBooking(reserva);
    setIsModalOpen(true);
  };

  const getReservasHora = (hour: number, canchaId: string) => {
    if (!calendarData) return [];
    
    const reservas = calendarData.reservas.filter(reserva => {
      const reservaHora = new Date(reserva.fechaHora).getHours();
      const coincide = reservaHora === hour && reserva.cancha.id === canchaId;
      
      if (coincide) {
        console.log('Reserva encontrada:', {
          hora: hour,
          canchaId,
          reservaHora,
          fechaHoraOriginal: reserva.fechaHora,
          reserva
        });
      }
      
      return coincide;
    });

    return reservas;
  };

  if (loading || !calendarData) return <div>Cargando...</div>;

  const gridTemplateColumns = calendarData.canchas.length <= 4 
    ? `60px repeat(${calendarData.canchas.length}, 1fr)`
    : `60px repeat(${calendarData.canchas.length}, minmax(200px, 1fr))`;

  return (
    <div className="w-full overflow-x-auto">
      <div 
        className="min-w-full"
        style={{
          display: 'grid',
          gridTemplateColumns,
        }}
      >
        {/* Header */}
        <div className="sticky left-0 bg-white z-10 border-b p-2"></div>
        {calendarData.canchas.map((cancha) => (
          <div key={cancha.id} className="p-2 text-center font-semibold border-b">
            {cancha.nombre}
            <div className="text-xs text-gray-500">{cancha.tipo}</div>
          </div>
        ))}

        {/* Horas y celdas */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="sticky left-0 bg-white z-10 p-2 text-right border-b">
              {`${hour}:00`}
            </div>
            {calendarData.canchas.map((cancha) => (
              <div key={`${hour}-${cancha.id}`} className="border-l border-b relative h-16">
                {getReservasHora(hour, cancha.id).map((reserva) => {
                  const horaInicio = new Date(reserva.fechaHora).getHours();
                  return (
                    <div
                      key={reserva.id}
                      className={`absolute inset-x-0 m-1 p-1 rounded ${getBookingStyle(reserva.estadoPago)} cursor-pointer`}
                      onClick={() => handleBookingClick(reserva)}
                      onKeyDown={(e) => e.key === 'Enter' && handleBookingClick(reserva)}
                      role="button"
                      tabIndex={0}
                      style={{
                        top: '0%',
                        height: `${reserva.duracion * 100}%`,
                      }}
                    >
                      <div className="text-xs font-semibold truncate">
                        {reserva.user.name || reserva.user.email}
                      </div>
                      <div className="text-xs">
                        {`${horaInicio}:00 - ${horaInicio + reserva.duracion}:00`}
                      </div>
                      <div className="text-xs">{reserva.estadoPago || "Pendiente"}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedBooking && (
          <div>
            <h2 className="text-xl font-bold mb-4">Detalles de la Reserva</h2>
            <p><strong>Cliente:</strong> {selectedBooking.user.name || selectedBooking.user.email}</p>
            <p><strong>Horario:</strong> {new Date(selectedBooking.fechaHora).toLocaleTimeString()}</p>
            <p><strong>Duración:</strong> {selectedBooking.duracion} hora(s)</p>
            <p><strong>Cancha:</strong> {selectedBooking.cancha.nombre}</p>
            <p><strong>Estado:</strong> {selectedBooking.estadoPago || "Pendiente"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarBox;
