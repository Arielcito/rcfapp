import { db } from '../db';
import { users } from '../db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import type { User, UserCreationData, UserUpdateData } from '../types/user';
import { logger } from '../utils/logger';

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

export const loginUser = async (email: string, password: string) => {
  logger.info('=== Inicio proceso de login ===');
  logger.info(`Buscando usuario con email: ${email}`);
  
  // Obtener usuario con todos los campos necesarios
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
    logger.warn(`Usuario no encontrado para email: ${email}`);
    throw new Error('Usuario no encontrado');
  }

  logger.info(`Usuario encontrado: ${JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  })}`);

  logger.info('Verificando contraseña');
  const isValidPassword = await bcrypt.compare(password, user.password || '');
  if (!isValidPassword) {
    logger.warn(`Contraseña incorrecta para usuario: ${user.id}`);
    throw new Error('Contraseña incorrecta');
  }

  logger.info(`Generando token para usuario: ${user.id}`);
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  // Excluir la contraseña del objeto de usuario
  const { password: _, ...userWithoutPassword } = user;
  logger.info(`Login completado exitosamente. Datos del usuario: ${JSON.stringify(userWithoutPassword)}`);
  logger.info('=== Fin proceso de login ===');

  return {
    user: userWithoutPassword,
    token
  };
};

export const registerUser = async (userData: UserCreationData) => {
  logger.info('Verificando si el email ya existe:', userData.email);
  const [existingUser] = await db.select()
    .from(users)
    .where(eq(users.email, userData.email));

  if (existingUser) {
    logger.warn(`Intento de registro con email existente: ${userData.email}`);
    throw new Error('El correo electrónico ya está registrado');
  }

  logger.info('Hasheando contraseña');
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  logger.info('Creando nuevo usuario');
  const [newUser] = await db.insert(users)
    .values({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: 'USER'
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    });

  logger.info(`Usuario creado exitosamente con ID: ${newUser.id}`);

  const token = jwt.sign(
    { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  logger.info('Token generado exitosamente');
  return {
    user: newUser,
    token
  };
};

export const getCurrentUserById = async (userId: string) => {
  logger.info('=== Obteniendo usuario actual ===');
  logger.info(`Buscando usuario con ID: ${userId}`);

  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role
  })
  .from(users)
  .where(eq(users.id, userId));

  if (!user) {
    logger.error(`Usuario no encontrado con ID: ${userId}`);
    throw new Error('Usuario no encontrado');
  }

  logger.info(`Usuario encontrado: ${JSON.stringify(user)}`);
  logger.info('=== Fin obtención usuario actual ===');

  return user;
};