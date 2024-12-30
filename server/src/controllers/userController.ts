import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import type { UserCreationData, UserUpdateData } from '../types/user';
import { logger } from '../utils/logger';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.createUser(req.body as UserCreationData);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.updateUser(req.params.id, req.body as UserUpdateData);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    logger.info(`Intento de login para email: ${email}`);

    if (!email || !password) {
      logger.warn('Intento de login sin email o password');
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    const { user, token } = await userService.loginUser(email, password);
    logger.info(`Login exitoso para usuario: ${user.id}`);

    // Establecer cookie con el token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    logger.info('Cookie establecida correctamente');
    res.json({ user, token });
  } catch (error) {
    logger.error('Error en login:', error);
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: UserCreationData = req.body;
    logger.info('Intento de registro con datos:', { ...userData, password: '***' });

    if (!userData.email || !userData.password || !userData.name) {
      logger.warn('Intento de registro con campos faltantes');
      res.status(400).json({ message: 'Todos los campos son requeridos' });
      return;
    }

    const { user, token } = await userService.registerUser(userData);
    logger.info(`Registro exitoso para usuario: ${user.id}`);

    // Establecer cookie con el token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    logger.info('Cookie establecida correctamente para nuevo usuario');
    res.status(201).json({ user });
  } catch (error) {
    logger.error('Error en registro:', error);
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie('auth_token');
    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.body.user?.id;
    logger.info(`Intento de obtener usuario actual. ID: ${userId}`);

    if (!userId) {
      logger.warn('Intento de obtener usuario actual sin ID');
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const user = await userService.getCurrentUserById(userId);
    logger.info(`Usuario actual obtenido correctamente: ${user.id}`);
    res.json(user);
  } catch (error) {
    logger.error('Error al obtener usuario actual:', error);
    next(error);
  }
};

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Verificar si el email ya existe usando drizzle
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: 'Este email ya está registrado'
      });
    }

    return res.status(200).json({
      message: 'Email disponible'
    });

  } catch (error) {
    console.error('Error al verificar email:', error);
    return res.status(500).json({
      message: 'Error al verificar el email'
    });
  }
};