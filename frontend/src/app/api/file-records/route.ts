import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';
    
    // Get auth token from request
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${backendUrl}/api/file-records`, {
      headers: {
        'authorization': authHeader || ''
      }
    });

    const result = await response.json();
    
    return NextResponse.json(result, { status: response.status });

  } catch (error) {
    console.error('Frontend file records API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch file records' },
      { status: 500 }
    );
  }
}
