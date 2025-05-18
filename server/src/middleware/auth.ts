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
    console.error('[Auth] Token no encontrado en los headers');
    return res.status(401).json({ 
      success: false,
      message: 'No autorizado - Token no proporcionado' 
    });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, secretKey) as JWTPayload;
  
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: null
    };
  
    console.log('[Auth] Usuario autenticado exitosamente');
    next();
  } catch (error: unknown) {
    console.error('[Auth] Error en la autenticación:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('[Auth] Error específico de JWT:', {
        name: error.name,
        message: error.message
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expirado',
          error: 'El token de autenticación ha expirado'
        });
      } else if (error.name === 'NotBeforeError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token aún no válido',
          error: 'El token no es válido en este momento'
        });
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Auth] Error no manejado:', errorMessage);
    res.status(401).json({ 
      success: false,
      message: 'Token inválido', 
      error: errorMessage 
    });
  }
};

export const authorizeRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('[Auth] Verificando roles:', {
      rolesRequeridos: roles,
      rolUsuario: req.user?.role
    });

    if (!req.user) {
      console.error('[Auth] Usuario no encontrado en la request');
      return res.status(401).json({ 
        success: false,
        message: 'No autorizado - Usuario no autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      console.error('[Auth] Rol no autorizado:', {
        rolUsuario: req.user.role,
        rolesPermitidos: roles
      });
      return res.status(403).json({ 
        success: false,
        message: 'No tienes permiso para realizar esta acción',
        error: 'Rol no autorizado'
      });
    }

    console.log('[Auth] Rol autorizado correctamente');
    next();
  };
};