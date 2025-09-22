import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Production-ready login route with HTTP-only cookies
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // In production, validate against your database
    // This is a mock implementation for demonstration
    let user = null;
    
    if (email === 'admin@example.com' && password === 'admin') {
      user = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      };
    } else if (email === 'user@example.com' && password === 'user') {
      user = {
        id: '2',
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user'
      };
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Set HTTP-only cookies with secure configuration
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60, // 15 minutes in seconds
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
