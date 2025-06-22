import { db } from '../db';
import type { Predio, PredioCreationData, PredioUpdateData } from '../types/predio';
import { predios as prediosSchema, canchas, reservas, deportes, horariosPredio, serviciosPredio } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

// Helper function to convert database result to Predio type
const convertDbToPredio = (dbResult: any): Predio => ({
  ...dbResult,
  usuarioId: dbResult.usuarioId || '',
  codigoPostal: dbResult.codigoPostal || undefined,
  telefono: dbResult.telefono || undefined,
  email: dbResult.email || undefined,
  cbu: dbResult.cbu || undefined,
  titularCuenta: dbResult.titularCuenta || undefined,
  tipoCuenta: dbResult.tipoCuenta || undefined,
  banco: dbResult.banco || undefined,
  numeroCuenta: dbResult.numeroCuenta || undefined,
  latitud: dbResult.latitud ? parseFloat(dbResult.latitud) : undefined,
  longitud: dbResult.longitud ? parseFloat(dbResult.longitud) : undefined,
  capacidadEstacionamiento: dbResult.capacidadEstacionamiento || undefined,
  tieneVestuarios: dbResult.tieneVestuarios || undefined,
  tieneCafeteria: dbResult.tieneCafeteria || undefined,
  horarioApertura: dbResult.horarioApertura || undefined,
  horarioCierre: dbResult.horarioCierre || undefined,
  diasOperacion: dbResult.diasOperacion || undefined,
  imagenUrl: dbResult.imagenUrl || undefined,
  fechaRegistro: dbResult.fechaRegistro || undefined
});

export const createPredio = async (predioData: PredioCreationData): Promise<Predio> => {
  const [dbResult] = await db.insert(prediosSchema)
    .values({
      ...predioData,
      latitud: predioData.latitud?.toString() || null,
      longitud: predioData.longitud?.toString() || null
    })
    .returning();

  return convertDbToPredio(dbResult);
};

export const getPredios = async (): Promise<Predio[]> => {
  const results = await db.select().from(prediosSchema);
  return results.map(convertDbToPredio);
};

export const getPredioById = async (id: string): Promise<any | null> => {
  try {
    console.log('Logging predio search by ID:', id);

    // Obtener el predio base
    const [dbResult] = await db.select()
      .from(prediosSchema)
      .where(eq(prediosSchema.id, id));

    if (!dbResult) {
      console.log('Logging predio not found for ID:', id);
      return null;
    }

    const predio = convertDbToPredio(dbResult);

    // Obtener los horarios del predio
    console.log('Logging predio schedule retrieval for ID:', id);
    const horarios = await db.select()
      .from(horariosPredio)
      .where(eq(horariosPredio.predioId, id));

    // Obtener los servicios del predio
    console.log('Logging predio services retrieval for ID:', id);
    const servicios = await db.select()
      .from(serviciosPredio)
      .where(eq(serviciosPredio.predioId, id));

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

    console.log('Logging successful predio retrieval with schedules and services for ID:', id);
    return predioCompleto;
  } catch (error) {
    console.error('Logging error retrieving predio by ID:', error);
    throw new Error('Error al obtener predio por ID');
  }
};

export const getPrediosByUsuarioId = async (usuarioId: string): Promise<Predio[]> => {
  const results = await db.select()
    .from(prediosSchema)
    .where(eq(prediosSchema.usuarioId, usuarioId));
  
  return results.map(convertDbToPredio);
};

export const getPredioByOwnerId = async (ownerId: string): Promise<Predio | null> => {
  const [dbResult] = await db.select()
    .from(prediosSchema)
    .where(eq(prediosSchema.usuarioId, ownerId));

  return dbResult ? convertDbToPredio(dbResult) : null;
};

export const updatePredio = async (id: string, predioData: PredioUpdateData): Promise<Predio | null> => {
  // Convert number fields to strings for database
  const dbUpdateData = {
    ...predioData,
    latitud: predioData.latitud?.toString() || undefined,
    longitud: predioData.longitud?.toString() || undefined
  };

  const [updatedResult] = await db.update(prediosSchema)
    .set(dbUpdateData)
    .where(eq(prediosSchema.id, id))
    .returning();

  return updatedResult ? convertDbToPredio(updatedResult) : null;
};

export const deletePredio = async (id: string): Promise<void> => {
  await db.delete(prediosSchema).where(eq(prediosSchema.id, id));
};

export const getPrediosWithAvailableCourts = async (fecha: string, hora: string, deporteId?: string): Promise<any[]> => {
  try { 
    console.log('Logging search for predios with available courts:', { fecha, hora, deporteId });
    
    // Construir la fecha y hora completa
    const fechaHora = new Date(`${fecha}T${hora}:00`);
    const fechaHoraFin = new Date(fechaHora);
    fechaHoraFin.setHours(fechaHoraFin.getHours() + 1); // Asumimos reservas de 1 hora
    
    console.log('Logging time range for availability search:', { 
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
      .innerJoin(canchas, eq(canchas.predioId, prediosSchema.id))
      .leftJoin(deportes, eq(canchas.deporteId, deportes.id))
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
          deporteId ? eq(canchas.deporteId, deporteId) : sql`1=1`
        )
      );

    const results = await baseQuery;
    console.log('Logging query results count:', results.length);

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
    console.log('Logging predios found with available courts:', prediosWithCourts.length);
    
    // Obtener horarios para cada predio
    console.log('Logging predio schedules retrieval...');
    for (const predio of prediosWithCourts) {
      const horarios = await db.select()
        .from(horariosPredio)
        .where(eq(horariosPredio.predioId, predio.id));
      
      predio.horarios = horarios;
      console.log(`Logging schedules count for predio ${predio.nombre}:`, horarios.length);
    }
    
    return prediosWithCourts;
  } catch (error) {
    console.error('Logging error getting predios with available courts:', error);
    throw new Error('Error al obtener predios con canchas disponibles');
  }
};