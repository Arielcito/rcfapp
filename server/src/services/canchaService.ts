import { db } from '../db';
import { canchas, predios } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Cancha, CanchaCreationData, CanchaUpdateData } from '../types/cancha';

const completarDatosCancha = (cancha: Partial<CanchaCreationData>): CanchaCreationData => {
  return {
    nombre: cancha.nombre || "Cancha sin nombre",
    predioId: cancha.predioId,
    ancho: "15",
    capacidadJugadores: 10,
    equipamientoIncluido: "Pelotas, pecheras, arcos con red",
    esTechada: false,
    estado: "Disponible",
    imagenUrl: "https://example.com/cancha-5.jpg",
    longitud: "25",
    tieneIluminacion: true,
    tipo: "Fútbol 5",
    tipoSuperficie: cancha.tipoSuperficie || "césped sintético",
    ultimoMantenimiento: new Date(),
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
    requiereSeña: canchas.requiereSeña,
    tieneIluminacion: canchas.tieneIluminacion,
    ultimoMantenimiento: canchas.ultimoMantenimiento,
    createdAt: canchas.createdAt,
    predio: {
      id: predios.id,
      nombre: predios.nombre,
      direccion: predios.direccion,
      telefono: predios.telefono
    }
  })
  .from(canchas)
  .leftJoin(predios, eq(canchas.predioId, predios.id))
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