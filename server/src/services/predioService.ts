import { db } from '../db';
import type { predios } from '../db/schema';
import type { eq } from 'drizzle-orm';
import type { Predio, PredioCreationData, PredioUpdateData } from '../types/predio';
import { predios as prediosSchema } from '../db/schema';
import { eq as eqOp } from 'drizzle-orm';
import { and, sql } from 'drizzle-orm';
import { canchas, reservas, deportes, horariosPredio, serviciosPredio } from '../db/schema';

export const createPredio = async (predioData: PredioCreationData): Promise<Predio> => {
  const [predio] = await db.insert(prediosSchema)
    .values(predioData)
    .returning() as Predio[];

  return predio;
};

export const getPredios = async (): Promise<Predio[]> => {
  const result = await db.select()
    .from(prediosSchema) as Predio[];
  return result;
};

export const getPredioById = async (id: string): Promise<any | null> => {
  try {
    console.log('🔍 [predioService] Buscando predio por ID:', id);

    // Obtener el predio base
    const [predio] = await db.select()
      .from(prediosSchema)
      .where(eqOp(prediosSchema.id, id)) as Predio[];

    if (!predio) {
      console.log('❌ [predioService] Predio no encontrado');
      return null;
    }

    // Obtener los horarios del predio
    console.log('🕒 [predioService] Obteniendo horarios del predio');
    const horarios = await db.select()
      .from(horariosPredio)
      .where(eqOp(horariosPredio.predioId, id));

    // Obtener los servicios del predio
    console.log('🛍️ [predioService] Obteniendo servicios del predio');
    const servicios = await db.select()
      .from(serviciosPredio)
      .where(eqOp(serviciosPredio.predioId, id));

    // Combinar toda la información
    const predioCompleto = {
      ...predio,
      horarios: horarios.map(horario => ({
        ...horario,
        horaInicio: horario.horaInicio.slice(0, 5), // Formatear hora (HH:mm)
        horaFin: horario.horaFin.slice(0, 5), // Formatear hora (HH:mm)
      })),
      servicios: servicios
    };

    console.log('✅ [predioService] Predio encontrado con horarios y servicios');
    return predioCompleto;
  } catch (error) {
    console.error('❌ [predioService] Error al obtener predio por ID:', error);
    throw new Error('Error al obtener predio por ID');
  }
};

export const getPrediosByUsuarioId = async (usuarioId: string): Promise<Predio[]> => {
  const result = await db.select()
    .from(prediosSchema)
    .where(eqOp(prediosSchema.usuarioId, usuarioId)) as Predio[];
  
  return result;
};

export const getPredioByOwnerId = async (ownerId: string): Promise<Predio | null> => {
  const [predio] = await db.select()
    .from(prediosSchema)
    .where(eqOp(prediosSchema.usuarioId, ownerId)) as Predio[];

  return predio || null;
};

export const updatePredio = async (id: string, predioData: PredioUpdateData): Promise<Predio | null> => {
  const [updatedPredio] = await db.update(prediosSchema)
    .set(predioData)
    .where(eqOp(prediosSchema.id, id))
    .returning() as Predio[];

  return updatedPredio || null;
};

export const deletePredio = async (id: string): Promise<void> => {
  await db.delete(prediosSchema).where(eqOp(prediosSchema.id, id));
};

export const getPrediosWithAvailableCourts = async (fecha: string, hora: string, deporteId?: string): Promise<any[]> => {
  try { 
    console.log('🔍 [predioService] Buscando predios con canchas disponibles:', { fecha, hora, deporteId });
    
    // Construir la fecha y hora completa
    const fechaHora = new Date(`${fecha}T${hora}:00`);
    const fechaHoraFin = new Date(fechaHora);
    fechaHoraFin.setHours(fechaHoraFin.getHours() + 1); // Asumimos reservas de 1 hora
    
    console.log('🕐 [predioService] Rango de tiempo:', { 
      inicio: fechaHora.toISOString(), 
      fin: fechaHoraFin.toISOString() 
    });

    // Query base con filtros opcionales
    let baseQuery = db
      .select({
        predio: {
          id: prediosSchema.id,
          usuarioId: prediosSchema.usuarioId,
          nombre: prediosSchema.nombre,
          direccion: prediosSchema.direccion,
          ciudad: prediosSchema.ciudad,
          provincia: prediosSchema.provincia,
          codigoPostal: prediosSchema.codigoPostal,
          telefono: prediosSchema.telefono,
          email: prediosSchema.email,
          cbu: prediosSchema.cbu,
          titularCuenta: prediosSchema.titularCuenta,
          tipoCuenta: prediosSchema.tipoCuenta,
          banco: prediosSchema.banco,
          numeroCuenta: prediosSchema.numeroCuenta,
          latitud: prediosSchema.latitud,
          longitud: prediosSchema.longitud,
          capacidadEstacionamiento: prediosSchema.capacidadEstacionamiento,
          tieneVestuarios: prediosSchema.tieneVestuarios,
          tieneCafeteria: prediosSchema.tieneCafeteria,
          horarioApertura: prediosSchema.horarioApertura,
          horarioCierre: prediosSchema.horarioCierre,
          diasOperacion: prediosSchema.diasOperacion,
          imagenUrl: prediosSchema.imagenUrl,
          fechaRegistro: prediosSchema.fechaRegistro,
        },
        cancha: {
          id: canchas.id,
          predioId: canchas.predioId,
          deporteId: canchas.deporteId,
          nombre: canchas.nombre,
          tipo: canchas.tipo,
          capacidadJugadores: canchas.capacidadJugadores,
          longitud: canchas.longitud,
          ancho: canchas.ancho,
          tipoSuperficie: canchas.tipoSuperficie,
          tieneIluminacion: canchas.tieneIluminacion,
          esTechada: canchas.esTechada,
          precioPorHora: canchas.precioPorHora,
          estado: canchas.estado,
          ultimoMantenimiento: canchas.ultimoMantenimiento,
          equipamientoIncluido: canchas.equipamientoIncluido,
          imagenUrl: canchas.imagenUrl,
          createdAt: canchas.createdAt,
          requiereSeña: canchas.requiereSeña,
          montoSeña: canchas.montoSeña,
        },
        deporte: {
          id: deportes.id,
          nombre: deportes.nombre,
          descripcion: deportes.descripcion,
        }
      })
      .from(prediosSchema)
      .innerJoin(canchas, eqOp(canchas.predioId, prediosSchema.id))
      .leftJoin(deportes, eqOp(canchas.deporteId, deportes.id))
      .where(
        and(
          // Solo canchas que no están reservadas en el horario especificado
          sql`NOT EXISTS (
            SELECT 1 FROM ${reservas} r 
            WHERE r."canchaId" = ${canchas.id}
            AND r."fechaHora" < ${fechaHoraFin}::timestamp
            AND (r."fechaHora" + INTERVAL '1 hour') > ${fechaHora}::timestamp
            AND r."estadoPago" != 'cancelado'
          )`,
          // Filtro opcional por deporte
          deporteId ? eqOp(canchas.deporteId, deporteId) : sql`1=1`
        )
      );

    const results = await baseQuery;
    console.log('📋 [predioService] Resultados de la query:', results.length);

    // Agrupar resultados por predio
    const prediosMap = new Map();
    
    results.forEach(row => {
      const predioId = row.predio.id;
      
      if (!prediosMap.has(predioId)) {
        prediosMap.set(predioId, {
          ...row.predio,
          canchas: []
        });
      }
      
      // Agregar cancha con información del deporte
      prediosMap.get(predioId).canchas.push({
        ...row.cancha,
        deporte: row.deporte
      });
    });

    const prediosWithCourts = Array.from(prediosMap.values());
    console.log('🏟️ [predioService] Predios con canchas disponibles:', prediosWithCourts.length);
    
    // Obtener horarios para cada predio
    console.log('🕐 [predioService] Obteniendo horarios de predios...');
    for (const predio of prediosWithCourts) {
      const horarios = await db.select()
        .from(horariosPredio)
        .where(eqOp(horariosPredio.predioId, predio.id));
      
      predio.horarios = horarios;
      console.log(`📅 [predioService] Horarios para predio ${predio.nombre}:`, horarios.length);
    }
    
    return prediosWithCourts;
  } catch (error) {
    console.error('❌ [predioService] Error al obtener predios con canchas disponibles:', error);
    throw new Error('Error al obtener predios con canchas disponibles');
  }
};