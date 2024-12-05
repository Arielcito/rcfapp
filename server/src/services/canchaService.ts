import { db } from '../db';
import { canchas } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Cancha, CanchaCreationData, CanchaUpdateData } from '../types/cancha';

export const createCancha = async (canchaData: CanchaCreationData): Promise<Cancha> => {
  const formattedData = {
    ...canchaData,
    longitud: canchaData.longitud?.toString() ?? null,
    ancho: canchaData.ancho?.toString() ?? null,
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
  const [cancha] = await db.select()
    .from(canchas)
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
  const formattedData = {
    ...canchaData,
    longitud: canchaData.longitud?.toString() ?? undefined,
    ancho: canchaData.ancho?.toString() ?? undefined,
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