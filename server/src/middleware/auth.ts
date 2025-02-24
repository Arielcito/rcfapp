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
  console.log("[Auth] Iniciando verificación de token");
  
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log("[Auth] Token no encontrado");
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    console.log("[Auth] Verificando token");
    
    const decoded = jwt.verify(
      token, 
      secretKey
    ) as JWTPayload;
    
    console.log("[Auth] Token verificado exitosamente");

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: null
    };
    
    console.log("[Auth] Usuario autenticado");
    next();
  } catch (error: unknown) {
    console.log("[Auth] Error en verificación de token");
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