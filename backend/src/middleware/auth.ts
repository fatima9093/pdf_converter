import { Request, Response, NextFunction } from 'express';
import { AuthService, Role } from '../lib/auth';
import { Role as PrismaRole } from '@prisma/client';
import prisma from '../lib/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from HTTP-only cookie first, then fall back to Authorization header
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }
    
    try {
      const payload = AuthService.verifyAccessToken(token);
      
      // Verify user still exists and is not blocked
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, isBlocked: true },
      });

      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
        return;
      }

      if (user.isBlocked) {
        res.status(403).json({ 
          success: false, 
          message: 'Your account has been blocked. Please contact support.' 
        });
        return;
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (jwtError) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const authorize = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};

export const adminOnly = authorize([PrismaRole.ADMIN]);
export const userOnly = authorize([PrismaRole.USER]);
export const adminOrUser = authorize([PrismaRole.ADMIN, PrismaRole.USER]);

// Optional authentication middleware - extracts user info if available, but doesn't reject if not
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from HTTP-only cookie first, then fall back to Authorization header
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    // If no token, continue without authentication
    if (!token) {
      next();
      return;
    }
    
    try {
      const payload = AuthService.verifyAccessToken(token);
      
      // Verify user still exists and is not blocked
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, isBlocked: true },
      });

      if (user && !user.isBlocked) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
        };
      }

      next();
    } catch (jwtError) {
      // Invalid token, but continue without authentication
      console.log('Optional auth: Invalid token, continuing as anonymous');
      next();
    }
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Continue even on error
    next();
  }
};