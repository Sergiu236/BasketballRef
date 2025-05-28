import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UserRole } from '../entities/User';
import { logger } from '../utils/logger';

// Extended Request interface to include user property
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    sessionId?: number;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = await AuthService.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const authorizeAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    next();
  } catch (error) {
    logger.error('Authorization error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 