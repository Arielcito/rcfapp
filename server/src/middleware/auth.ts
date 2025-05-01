import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types/user';

interface JWTPayload {
  id: string;
  email: string;
  role: Role;
}

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        name: string | null;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(
      token, 
      secretKey
    ) as JWTPayload;
  
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: null
    };
  
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      } else if (error.name === 'NotBeforeError') {
        return res.status(401).json({ message: 'Token aún no válido' });
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(401).json({ message: 'Token inválido', error: errorMessage });
  }
};

export const authorizeRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    next();
  };
};