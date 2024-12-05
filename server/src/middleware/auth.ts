import type { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Role, User } from '../types/user';

// Extender la interfaz Request
interface Request extends ExpressRequest {
  user?: User;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | undefined => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const user = jwt.verify(token, process.env.JWT_SECRET) as User;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorizeRole = (roles: Role[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | undefined => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};