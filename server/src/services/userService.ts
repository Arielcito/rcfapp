import { db } from '../db';
import { users } from '../db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { User, UserCreationData, UserUpdateData } from '../types/user';

export const createUser = async (userData: UserCreationData): Promise<User> => {
  const { name, email, password, role = 'USER' } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db.insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      role
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    });

  return user;
};

export const getUsers = async (): Promise<User[]> => {
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role
  }).from(users);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role
  })
  .from(users)
  .where(eq(users.id, id));

  return user || null;
};

export const updateUser = async (id: string, userData: UserUpdateData): Promise<User | null> => {
  const { name, email, password, role } = userData;
  const updateData: Partial<User> = { name, email, role };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const [updatedUser] = await db.update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    });

  return updatedUser || null;
};

export const deleteUser = async (id: string): Promise<void> => {
  await db.delete(users).where(eq(users.id, id));
};