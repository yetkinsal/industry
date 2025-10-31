import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'No token provided',
      });
    }

    const user = await authService.verifyToken(token);
    (req as any).user = user; // Attach user to request

    next();
  } catch (error: any) {
    return res.status(403).json({
      error: 'Forbidden',
      message: error.message || 'Invalid token',
    });
  }
};

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }

  next();
};

/**
 * Optional auth middleware - attaches user if token is present but doesn't fail if missing
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const user = await authService.verifyToken(token);
      (req as any).user = user;
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};
