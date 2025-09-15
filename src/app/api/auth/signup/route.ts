import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Mock user creation logic
    // In a real app, you would save to a database
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: 'user' as const,
      createdAt: new Date()
    };

    return NextResponse.json({
      success: true,
      user: newUser,
      token: `mock-token-${newUser.id}`,
      message: 'Account created successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
