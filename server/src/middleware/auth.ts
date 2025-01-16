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
  console.log("=== Inicio de verificación de token ===");
  console.log("Headers completos:", req.headers);
  console.log("Authorization header:", req.headers.authorization);
  
  const token = req.headers.authorization?.split(' ')[1];
  console.log("Token extraído:", token);
  
  if (!token) {
    console.log("No se encontró token en el header");
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    console.log("Secret key configurada:", secretKey ? 'Existe' : 'Usando valor por defecto');
    
    console.log("Intentando verificar token...");
    const decoded = jwt.verify(
      token, 
      secretKey
    ) as JWTPayload;
    
    console.log("Token decodificado exitosamente:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tokenCompleto: decoded
    });

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: null
    };
    
    console.log("Usuario agregado a req.user:", req.user);
    console.log("Tipo de role:", typeof req.user.role);
    console.log("Valor de role:", req.user.role);
    console.log("=== Fin de verificación de token ===");
    next();
  } catch (error: unknown) {
    console.log("=== Error detallado en verificación ===");
    console.log("Error completo:", error);
    console.log("Tipo de error:", typeof error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.log("Tipo específico de error JWT:", error.name);
      console.log("Mensaje de error JWT:", error.message);
      console.log("Stack de error:", error.stack);
    }
    console.log("=== Fin de error detallado ===");
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