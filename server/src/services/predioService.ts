import { db } from '../db';
import type { predios } from '../db/schema';
import type { eq } from 'drizzle-orm';
import type { Predio, PredioCreationData, PredioUpdateData } from '../types/predio';
import { predios as prediosSchema } from '../db/schema';
import { eq as eqOp } from 'drizzle-orm';

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

export const getPredioById = async (id: string): Promise<Predio | null> => {
  const [predio] = await db.select()
    .from(prediosSchema)
    .where(eqOp(prediosSchema.id, id)) as Predio[];

  return predio || null;
};

export const getPrediosByUsuarioId = async (usuarioId: string): Promise<Predio[]> => {
  const result = await db.select()
    .from(prediosSchema)
    .where(eqOp(prediosSchema.usuarioId, usuarioId)) as Predio[];
  
  return result;
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