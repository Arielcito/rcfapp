import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types/user';
import { logger } from '../utils/logger';

interface JWTPayload {
  id: string;
  email: string;
  role: Role;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.auth_token;
  logger.info('Verificando token de autenticación');

  if (!token) {
    logger.warn('No se encontró token en las cookies');
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;
    
    logger.info('Token verificado exitosamente');
    req.body.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: null // Podríamos obtener el nombre de la base de datos si es necesario
    };
    next();
  } catch (error) {
    logger.error('Error al verificar token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

export const authorizeRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Verificando rol de usuario. Roles permitidos: ${roles.join(', ')}`);
    
    if (!req.body.user) {
      logger.warn('No hay usuario en el request');
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (!roles.includes(req.body.user.role)) {
      logger.warn(`Usuario con rol ${req.body.user.role} intentó acceder a ruta protegida`);
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    logger.info('Autorización de rol exitosa');
    next();
  };
};