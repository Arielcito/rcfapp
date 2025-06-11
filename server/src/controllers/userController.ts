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
    const { id } = req.params;
    const { name, email, phone, image } = req.body;

    const user = await userService.updateUser(id, { name, email, phone, image } as UserUpdateData);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
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

    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    const { user, token } = await userService.loginUser(email, password);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.setHeader('Authorization', `Bearer ${token}`);
    res.json({ user, token });
  } catch (error) {
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

    if (!userData.email || !userData.password || !userData.name) {
      res.status(400).json({ message: 'Todos los campos son requeridos' });
      return;
    }

    const { user, token } = await userService.registerUser(userData);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({ user });
  } catch (error) {
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
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const user = await userService.getCurrentUserById(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

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
    return res.status(500).json({
      message: 'Error al verificar el email'
    });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'La contraseña actual y la nueva contraseña son requeridas' });
      return;
    }

    await userService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Contraseña actual incorrecta') {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message === 'Usuario no encontrado') {
        res.status(404).json({ message: error.message });
        return;
      }
    }
    next(error);
  }
};