import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { validateRefreshToken } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    // Validate refresh token from HTTP-only cookie
    const validation = validateRefreshToken(request);
    
    if (!validation.isValid || !validation.user) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const user = validation.user;

    // Generate new tokens
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';

    const newAccessToken = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully'
    });

    // Set new HTTP-only cookies
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60, // 15 minutes in seconds
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
