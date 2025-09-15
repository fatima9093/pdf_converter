import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from './database';
import { $Enums } from '@prisma/client';

// Use Prisma's Role enum
export type Role = $Enums.Role;
export const Role = $Enums.Role;

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface SessionData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}


export class AuthService {
  private static readonly JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  private static readonly JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';
  private static readonly JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m';
  private static readonly JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  // Password hashing
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // JWT token generation
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'pdf-converter-api',
      audience: 'pdf-converter-client',
    } as any);
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      issuer: 'pdf-converter-api',
      audience: 'pdf-converter-client',
    } as any);
  }

  // JWT token verification
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'pdf-converter-api',
        audience: 'pdf-converter-client',
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'pdf-converter-api',
        audience: 'pdf-converter-client',
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  // Session management
  static async createSession(userId: string): Promise<string> {
    // Generate a secure random token for the session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create session in database
    await prisma.session.create({
      data: {
        userId,
        refreshToken: sessionToken,
        expiresAt,
      },
    });

    return sessionToken;
  }

  static async validateSession(sessionToken: string): Promise<SessionData | null> {
    try {
      const session = await prisma.session.findUnique({
        where: { refreshToken: sessionToken },
      });

      if (!session) {
        return null;
      }

      // Check if session has expired
      if (session.expiresAt < new Date()) {
        // Remove expired session
        await this.revokeSession(sessionToken);
        return null;
      }

      return {
        id: session.id,
        userId: session.userId,
        token: session.refreshToken,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  static async revokeSession(sessionToken: string): Promise<void> {
    try {
      await prisma.session.delete({
        where: { refreshToken: sessionToken },
      });
    } catch (error) {
      // Session might not exist, which is fine
      console.log('Session revocation note:', error);
    }
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });
    } catch (error) {
      console.error('Error revoking all user sessions:', error);
    }
  }

  static async cleanExpiredSessions(): Promise<void> {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      console.log(`🧹 Cleaned ${result.count} expired sessions`);
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
    }
  }

  // Utility methods
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
