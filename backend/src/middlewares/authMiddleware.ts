import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Define custom interface extending Express Request to contain authenticated user info
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Middleware to protect routes and verify JSON Web Tokens
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      message: 'Access denied. Authorization token missing or malformed.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      status: 'error',
      message: 'Access denied. Token is invalid or expired.',
    });
    return;
  }

  // Attach the authenticated user's ID to the request object
  req.userId = decoded.userId;
  next();
}
