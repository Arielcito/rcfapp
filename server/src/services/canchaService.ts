import { db } from '../db';
import { canchas, predios, deportes, reservas } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { Cancha, CanchaCreationData, CanchaUpdateData } from '../types/cancha';

const completarDatosCancha = (cancha: Partial<CanchaCreationData>): CanchaCreationData => {
  return {
    nombre: cancha.nombre || "Cancha sin nombre",
    predioId: cancha.predioId || "",
    deporteId: cancha.deporteId || "",
    ancho: "15",
    capacidadJugadores: 10,
    equipamientoIncluido: "Pelotas, pecheras, arcos con red",
    esTechada: false,
    estado: "Disponible",
    longitud: "25",
    tieneIluminacion: true,
    tipo: "Fútbol 5",
    tipoSuperficie: cancha.tipoSuperficie || "césped sintético",
    precioPorHora: cancha.precioPorHora || 20000,
    requiereSeña: cancha.requiereSeña ?? true,
    montoSeña: cancha.montoSeña || 10000
  };
};

export const createCancha = async (canchaData: CanchaCreationData): Promise<Cancha> => {
  const datosCompletos = completarDatosCancha(canchaData);
  const formattedData = {
    ...datosCompletos,
    longitud: datosCompletos.longitud?.toString() ?? null,
    ancho: datosCompletos.ancho?.toString() ?? null,
    precioPorHora: datosCompletos.precioPorHora?.toString() ?? null,
  };
  console.log('Datos completos:', formattedData);
  const [cancha] = await db.insert(canchas)
    .values(formattedData)
    .returning();

  return cancha as unknown as Cancha;
};

export const getCanchas = async (): Promise<Cancha[]> => {
  const result = await db.select()
    .from(canchas) as unknown as Cancha[];
  
  return result;
};

export const getCanchaById = async (id: string): Promise<Cancha | null> => {
  const [cancha] = await db.select({
    id: canchas.id,
    nombre: canchas.nombre,
    tipo: canchas.tipo,
    tipoSuperficie: canchas.tipoSuperficie,
    imagenUrl: canchas.imagenUrl,
    ancho: canchas.ancho,
    longitud: canchas.longitud,
    capacidadJugadores: canchas.capacidadJugadores,
    equipamientoIncluido: canchas.equipamientoIncluido,
    esTechada: canchas.esTechada,
    estado: canchas.estado,
    montoSeña: canchas.montoSeña,
    precioPorHora: canchas.precioPorHora,
    predioId: canchas.predioId,
    deporteId: canchas.deporteId,
    requiereSeña: canchas.requiereSeña,
    tieneIluminacion: canchas.tieneIluminacion,
    ultimoMantenimiento: canchas.ultimoMantenimiento,
    createdAt: canchas.createdAt,
    predio: {
      id: predios.id,
      nombre: predios.nombre,
      direccion: predios.direccion,
      telefono: predios.telefono
    },
    deporte: {
      id: deportes.id,
      nombre: deportes.nombre,
      descripcion: deportes.descripcion
    }
  })
  .from(canchas)
  .leftJoin(predios, eq(canchas.predioId, predios.id))
  .leftJoin(deportes, eq(canchas.deporteId, deportes.id))
  .where(eq(canchas.id, id));

  return cancha as unknown as Cancha | null;
};

export const getCanchasByPredioId = async (predioId: string): Promise<Cancha[]> => {
  const result = await db.select()
    .from(canchas)
    .where(eq(canchas.predioId, predioId));
  
  return result as unknown as Cancha[];
};

export const updateCancha = async (id: string, canchaData: CanchaUpdateData): Promise<Cancha | null> => {
  const datosCompletos = completarDatosCancha(canchaData);
  const formattedData = {
    ...datosCompletos,
    longitud: datosCompletos.longitud?.toString() ?? undefined,
    ancho: datosCompletos.ancho?.toString() ?? undefined,
    precioPorHora: datosCompletos.precioPorHora?.toString() ?? undefined,
  };

  const [updatedCancha] = await db.update(canchas)
    .set(formattedData)
    .where(eq(canchas.id, id))
    .returning();

  return updatedCancha as unknown as Cancha | null;
};

export const deleteCancha = async (id: string): Promise<void> => {
  await db.delete(canchas).where(eq(canchas.id, id));
};

export const getAvailableCanchasByPredioId = async (predioId: string, fecha: string, hora: string): Promise<Cancha[]> => {
  try {
    console.log('🔍 [canchaService] Buscando canchas disponibles para predio:', { predioId, fecha, hora });
    
    // Construir la fecha y hora completa
    const fechaHora = new Date(`${fecha}T${hora}:00`);
    const fechaHoraFin = new Date(fechaHora);
    fechaHoraFin.setHours(fechaHoraFin.getHours() + 1); // Asumimos reservas de 1 hora
    
    console.log('🕐 [canchaService] Rango de tiempo:', { 
      inicio: fechaHora.toISOString(), 
      fin: fechaHoraFin.toISOString() 
    });

    const availableCanchas = await db.select({
      id: canchas.id,
      nombre: canchas.nombre,
      tipo: canchas.tipo,
      tipoSuperficie: canchas.tipoSuperficie,
      imagenUrl: canchas.imagenUrl,
      ancho: canchas.ancho,
      longitud: canchas.longitud,
      capacidadJugadores: canchas.capacidadJugadores,
      equipamientoIncluido: canchas.equipamientoIncluido,
      esTechada: canchas.esTechada,
      estado: canchas.estado,
      montoSeña: canchas.montoSeña,
      precioPorHora: canchas.precioPorHora,
      predioId: canchas.predioId,
      deporteId: canchas.deporteId,
      requiereSeña: canchas.requiereSeña,
      tieneIluminacion: canchas.tieneIluminacion,
      ultimoMantenimiento: canchas.ultimoMantenimiento,
      createdAt: canchas.createdAt,
      predio: {
        id: predios.id,
        nombre: predios.nombre,
        direccion: predios.direccion,
        telefono: predios.telefono
      },
      deporte: {
        id: deportes.id,
        nombre: deportes.nombre,
        descripcion: deportes.descripcion
      }
    })
    .from(canchas)
    .leftJoin(predios, eq(canchas.predioId, predios.id))
    .leftJoin(deportes, eq(canchas.deporteId, deportes.id))
    .where(
      and(
        eq(canchas.predioId, predioId),
        // Solo canchas que no están reservadas en el horario especificado
        sql`NOT EXISTS (
          SELECT 1 FROM ${reservas} r 
          WHERE r."canchaId" = ${canchas.id}
          AND r."fechaHora" < ${fechaHoraFin}::timestamp
          AND (r."fechaHora" + INTERVAL '1 hour') > ${fechaHora}::timestamp
          AND r."estadoPago" != 'cancelado'
        )`
      )
    );

    console.log('📋 [canchaService] Canchas disponibles encontradas:', availableCanchas.length);
    return availableCanchas as unknown as Cancha[];
  } catch (error) {
    console.error('❌ [canchaService] Error al obtener canchas disponibles:', error);
    throw new Error('Error al obtener canchas disponibles');
  }
};