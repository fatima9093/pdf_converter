import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Middleware to validate JWT tokens from HTTP-only cookies
export function validateToken(request: NextRequest): { isValid: boolean; user?: JWTPayload; error?: string } {
  try {
    // Get access token from HTTP-only cookie
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return { isValid: false, error: 'Access token not found' };
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as JWTPayload;
      return { isValid: true, user: decoded };
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return { isValid: false, error: 'Access token has expired' };
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return { isValid: false, error: 'Invalid access token' };
      } else {
        return { isValid: false, error: 'Token verification failed' };
      }
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, error: 'Internal server error' };
  }
}

// Higher-order function to protect API routes
export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = validateToken(request);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = validation.user;
    
    return handler(authenticatedRequest);
  };
}

// Role-based authorization
export function withRole(requiredRole: string) {
  return function(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
      if (request.user?.role !== requiredRole) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request);
    });
  };
}

// Admin-only protection
export const withAdminAuth = withRole('admin');

// Refresh token validation
export function validateRefreshToken(request: NextRequest): { isValid: boolean; user?: JWTPayload; error?: string } {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return { isValid: false, error: 'Refresh token not found' };
    }

    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';
    
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JWTPayload;
      return { isValid: true, user: decoded };
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return { isValid: false, error: 'Refresh token has expired' };
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return { isValid: false, error: 'Invalid refresh token' };
      } else {
        return { isValid: false, error: 'Refresh token verification failed' };
      }
    }
  } catch (error) {
    console.error('Refresh token validation error:', error);
    return { isValid: false, error: 'Internal server error' };
  }
}
