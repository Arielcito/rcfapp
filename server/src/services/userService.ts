import { db } from '../db';
import { users } from '../db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, sql } from 'drizzle-orm';
import type { User, UserCreationData, UserUpdateData } from '../types/user';
import { logger } from '../utils/logger';
import { createId } from '../utils/ids';

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
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      return null;
    }
    
    const userResponse = {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      role: user.role,
      telefono: user.telefono ?? null,
      direccion: user.direccion ?? null,
      predioTrabajo: user.predioTrabajo ?? null,
      createdAt: user.createdAt ?? null,
      updatedAt: user.updatedAt ?? null
    };

    return userResponse;
  } catch (error) {
    throw error;
  }
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

export const loginUser = async (email: string, password: string) => {
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    password: users.password,
    emailVerified: users.emailVerified,
    image: users.image,
    predioTrabajo: users.predioTrabajo,
    createdAt: users.createdAt
  })
  .from(users)
  .where(eq(users.email, email));

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isValidPassword = await bcrypt.compare(password, user.password || '');
  if (!isValidPassword) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};

export const registerUser = async (userData: UserCreationData) => {
  try {
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, userData.email));

    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = createId();

    const [newUser] = await db.insert(users)
      .values({
        id: userId,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'USER',
        telefono: userData.telefono,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        telefono: users.telefono,
        createdAt: users.createdAt
      });

    if (!newUser) {
      throw new Error('Error al crear el usuario');
    }

    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return {
      user: newUser,
      token
    };
  } catch (error) {
    throw error;
  }
};

export const getCurrentUserById = async (userId: string) => {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};
