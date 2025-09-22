import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

// Protected route to get current user information
async function handler(request: AuthenticatedRequest) {
  try {
    // User information is available from the authenticated request
    const user = request.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // In a real application, you might want to fetch additional user data from the database
    // using the user.userId
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.userId,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the protected handler
export const GET = withAuth(handler);
