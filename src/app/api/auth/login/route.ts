import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Mock authentication logic
    // In a real app, you would validate against a database
    if (email === 'admin@example.com' && password === 'admin') {
      return NextResponse.json({
        success: true,
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        },
        token: 'mock-admin-token'
      });
    }

    if (email === 'user@example.com' && password === 'user') {
      return NextResponse.json({
        success: true,
        user: {
          id: '2',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user'
        },
        token: 'mock-user-token'
      });
    }

    // Invalid credentials
    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
