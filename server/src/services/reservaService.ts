import { db } from '../db';
import { reservas as Reserva, pagos as Pago, canchas, predios } from '../db/schema';
import { eq, sql, and, lt, gt } from 'drizzle-orm';
import type { CreateReservaDTO, UpdateReservaDTO } from '../types/reserva';

export class ReservaService {
  async createReserva(data: CreateReservaDTO) {
    console.log('[ReservaService] Iniciando creación de reserva');
    console.log('[ReservaService] Datos recibidos:', JSON.stringify(data, null, 2));
    
    try {
      console.log('[ReservaService] Validando datos de entrada...');
      if (!data.canchaId) {
        console.error('[ReservaService] Error: canchaId es requerido');
        throw new Error('canchaId es requerido');
      }
      if (!data.userId) {
        console.error('[ReservaService] Error: userId es requerido');
        throw new Error('userId es requerido');
      }
      if (!data.fechaHora) {
        console.error('[ReservaService] Error: fechaHora es requerido');
        throw new Error('fechaHora es requerido');
      }

      console.log('[ReservaService] Preparando datos para inserción...');
      const fechaHora = new Date(data.fechaHora);
      console.log('[ReservaService] Fecha parseada:', fechaHora.toISOString());

      const reservaData = {
        canchaId: data.canchaId,
        userId: data.userId,
        fechaHora: fechaHora,
        duracion: data.duracion,
        precioTotal: data.precioTotal?.toString(),
        estadoPago: 'PENDIENTE',
        metodoPago: data.metodoPago,
        notasAdicionales: data.notasAdicionales,
      };
      console.log('[ReservaService] Datos preparados para inserción:', JSON.stringify(reservaData, null, 2));

      console.log('[ReservaService] Intentando insertar en la base de datos...');
      const [nuevaReserva] = await db.insert(Reserva).values(reservaData).returning();

      // Obtener datos completos de la cancha
      const [cancha] = await db.select()
        .from(canchas)
        .where(eq(canchas.id, data.canchaId));

      // Obtener datos del predio
      const [predio] = await db.select()
        .from(predios)
        .where(eq(predios.id, cancha.predioId));

      // Combinar todos los datos
      const reservaCompleta = {
        ...nuevaReserva,
        cancha: {
          ...cancha,
          nombre: cancha.nombre || "Cancha sin nombre",
          tipo: cancha.tipo || "Fútbol",
          tipoSuperficie: cancha.tipoSuperficie || "Césped sintético",
          longitud: cancha.longitud || "25",
          ancho: cancha.ancho || "15",
        },
        predio: {
          ...predio,
          telefono: predio?.telefono || "+54123456789"
        }
      };

      console.log('[ReservaService] Reserva creada exitosamente:', JSON.stringify(reservaCompleta, null, 2));
      return reservaCompleta;
    } catch (error) {
      console.error('[ReservaService] Error detallado al crear reserva:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        error: JSON.stringify(error)
      });
      throw new Error(`Error al crear la reserva: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getReservaById(id: string) {
    console.log('[ReservaService] Buscando reserva por ID:', id);
    try {
      const reserva = await db.select()
        .from(Reserva)
        .where(eq(Reserva.id, id))
        .leftJoin(Pago, eq(Reserva.pagoId, Pago.id));
      
      console.log('[ReservaService] Reserva encontrada:', reserva[0]);
      return reserva[0];
    } catch (error) {
      console.error('[ReservaService] Error al obtener reserva:', error);
      throw new Error('Error al obtener la reserva');
    }
  }

  async updateReserva(id: string, data: UpdateReservaDTO) {
    console.log('[ReservaService] Actualizando reserva:', { id, data });
    try {
      const updateData = {
        ...data,
        precioTotal: data.precioTotal?.toString(),
      };

      const reservaActualizada = await db.update(Reserva)
        .set(updateData)
        .where(eq(Reserva.id, id))
        .returning();

      console.log('[ReservaService] Reserva actualizada:', reservaActualizada[0]);
      return reservaActualizada[0];
    } catch (error) {
      console.error('[ReservaService] Error al actualizar reserva:', error);
      throw new Error('Error al actualizar la reserva');
    }
  }

  async checkReservaAvailability(canchaId: string, fechaHora: Date, duracion: number) {
    console.log('[ReservaService] Datos recibidos:', { canchaId, fechaHora, duracion });
    
    if (!canchaId || !fechaHora || !duracion) {
      console.error('[ReservaService] Datos inválidos:', { canchaId, fechaHora, duracion });
      throw new Error('Datos incompletos para verificar disponibilidad');
    }

    try {
      const fechaInicio = new Date(fechaHora);
      if (Number.isNaN(fechaInicio.getTime())) {
        throw new Error('Fecha inválida');
      }

      const fechaFin = new Date(fechaInicio);
      fechaFin.setMinutes(fechaFin.getMinutes() + duracion);

      console.log('[ReservaService] Rango de fechas a verificar:', {
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      });

      const reservasExistentes = await db
        .select()
        .from(Reserva)
        .where(
          and(
            eq(Reserva.canchaId, canchaId),
            sql`${Reserva.fechaHora} < ${fechaFin}::timestamp`,
            sql`${Reserva.fechaHora} + make_interval(mins => ${duracion}) > ${fechaInicio}::timestamp`
          )
        );

      console.log('[ReservaService] Reservas existentes encontradas:', reservasExistentes);
      return reservasExistentes.length === 0;
    } catch (error) {
      console.error('[ReservaService] Error al verificar disponibilidad:', error);
      throw new Error(error instanceof Error ? error.message : 'Error al verificar la disponibilidad de la reserva');
    }
  }

  async getAvailableTimes(fecha: string) {
    console.log('[ReservaService] Obteniendo horarios disponibles para fecha:', fecha);
    try {
      const reservasDelDia = await db
        .select()
        .from(Reserva)
        .where(sql`DATE(${Reserva.fechaHora}) = DATE(${fecha})`);

      console.log('[ReservaService] Reservas encontradas para el día:', reservasDelDia);
      
      const horariosOcupados = reservasDelDia.map(reserva => {
        const hora = new Date(reserva.fechaHora).getHours();
        return `${hora.toString().padStart(2, '0')}:00`;
      });

      console.log('[ReservaService] Horarios ocupados:', horariosOcupados);
      return horariosOcupados;
    } catch (error) {
      console.error('[ReservaService] Error al obtener horarios disponibles:', error);
      throw new Error('Error al obtener horarios disponibles');
    }
  }

  async getReservasByDate(date: string, ownerId: string) {
    console.log('[ReservaService] Buscando reservas por fecha y owner:', { date, ownerId });
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      console.log('[ReservaService] Rango de fechas:', { startDate, endDate });

      const reservasDelDia = await db
        .select()
        .from(Reserva)
        .where(
          and(
            gt(Reserva.fechaHora, startDate),
            lt(Reserva.fechaHora, endDate),
            sql`EXISTS (
              SELECT 1 FROM ${predios} 
              JOIN ${canchas} ON ${canchas.predioId} = ${predios.id}
              WHERE ${canchas.id} = ${Reserva.canchaId} 
              AND ${predios.usuarioId} = ${ownerId}
            )`
          )
        )
        .orderBy(Reserva.fechaHora);

      console.log('[ReservaService] Reservas encontradas:', reservasDelDia);
      return reservasDelDia;
    } catch (error) {
      console.error('[ReservaService] Error al obtener reservas por fecha:', error);
      throw new Error('Error al obtener las reservas del día');
    }
  }

  async getUserBookings(userId: string) {
    console.log('[ReservaService] Obteniendo reservas del usuario:', userId);
    try {
      const reservas = await db
        .select({
          id: Reserva.id,
          fechaHora: Reserva.fechaHora,
          duracion: Reserva.duracion,
          precioTotal: Reserva.precioTotal,
          estadoPago: Reserva.estadoPago,
          metodoPago: Reserva.metodoPago,
          notasAdicionales: Reserva.notasAdicionales,
          cancha: {
            id: canchas.id,
            nombre: canchas.nombre,
            tipo: canchas.tipo,
            tipoSuperficie: canchas.tipoSuperficie,
            longitud: canchas.longitud,
            ancho: canchas.ancho,
          },
          predio: {
            id: predios.id,
            nombre: predios.nombre,
            direccion: predios.direccion,
            telefono: predios.telefono,
          }
        })
        .from(Reserva)
        .where(eq(Reserva.userId, userId))
        .leftJoin(canchas, eq(Reserva.canchaId, canchas.id))
        .leftJoin(predios, eq(canchas.predioId, predios.id))
        .orderBy(Reserva.fechaHora);

      console.log('[ReservaService] Reservas encontradas:', reservas);
      return reservas;
    } catch (error) {
      console.error('[ReservaService] Error al obtener reservas del usuario:', error);
      throw new Error('Error al obtener las reservas del usuario');
    }
  }
} 