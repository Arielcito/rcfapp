import { db } from '../db';
import { users } from '../db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, sql } from 'drizzle-orm';
import type { User, UserCreationData, UserUpdateData } from '../types/user';
import { Role } from '../types/user';
import { logger } from '../utils/logger';
import { createId } from '../utils/ids';

export const createUser = async (userData: UserCreationData): Promise<User> => {
  const { name, email, password, role = Role.USER } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db.insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      role: role.toString() as 'USER' | 'ADMIN' | 'OWNER',
      googleCalendarEnabled: false,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
      googleCalendarId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      googleCalendarEnabled: users.googleCalendarEnabled,
      googleAccessToken: users.googleAccessToken,
      googleRefreshToken: users.googleRefreshToken,
      googleTokenExpiry: users.googleTokenExpiry,
      googleCalendarId: users.googleCalendarId
    });

  // Convert the database role string to Role enum
  return {
    ...user,
    role: user.role as Role
  };
};

export const getUsers = async (): Promise<User[]> => {
  const usersFromDb = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    googleCalendarEnabled: users.googleCalendarEnabled,
    googleAccessToken: users.googleAccessToken,
    googleRefreshToken: users.googleRefreshToken,
    googleTokenExpiry: users.googleTokenExpiry,
    googleCalendarId: users.googleCalendarId
  }).from(users);

  // Convert database role strings to Role enum
  return usersFromDb.map(user => ({
    ...user,
    role: user.role as Role
  }));
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
    
    const userResponse: User = {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      role: user.role as Role,
      telefono: user.telefono ?? null,
      emailVerified: user.emailVerified ? new Date() : null,
      image: user.image ?? null
    };

    return userResponse;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id: string, userData: UserUpdateData): Promise<User | null> => {
  const { name, email, role, telefono, image } = userData;
  
  // Create update data with proper types for database
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role.toString() as 'USER' | 'ADMIN' | 'OWNER';
  if (telefono !== undefined) updateData.telefono = telefono;
  if (image !== undefined) updateData.image = image;
  
  console.log("Logging updateData being sent to database:", updateData);
  
  const [updatedUser] = await db.update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      telefono: users.telefono,
      image: users.image,
      emailVerified: users.emailVerified
    });
  
  if (!updatedUser) return null;
  
  console.log("Logging updated user returned from database:", updatedUser);
  
  // Convert to User type with proper role conversion
  const result: User = {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role as Role,
    telefono: updatedUser.telefono,
    image: updatedUser.image,
    emailVerified: updatedUser.emailVerified ? new Date() : null
  };
  
  return result;
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
    createdAt: users.createdAt,
    googleCalendarEnabled: users.googleCalendarEnabled,
    googleAccessToken: users.googleAccessToken,
    googleRefreshToken: users.googleRefreshToken,
    googleTokenExpiry: users.googleTokenExpiry,
    googleCalendarId: users.googleCalendarId
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
        createdAt: users.createdAt,
        googleCalendarEnabled: users.googleCalendarEnabled,
        googleAccessToken: users.googleAccessToken,
        googleRefreshToken: users.googleRefreshToken,
        googleTokenExpiry: users.googleTokenExpiry,
        googleCalendarId: users.googleCalendarId
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

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password || '');
  if (!isValidPassword) {
    throw new Error('Contraseña actual incorrecta');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await db.update(users)
    .set({ password: hashedNewPassword })
    .where(eq(users.id, userId));
};
