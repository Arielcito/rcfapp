import { db } from '../db';
import { deportes } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getDeportes = async () => {
  const result = await db.select().from(deportes);
  return result;
};

export const getDeporteById = async (id: string) => {
  const [deporte] = await db.select().from(deportes).where(eq(deportes.id, id));
  return deporte;
}; 