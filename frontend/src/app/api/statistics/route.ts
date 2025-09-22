import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';
    
    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Forward all cookies from the request
    const cookieHeader = request.headers.get('cookie');
    
    console.log('Statistics API - Cookie header:', cookieHeader ? 'Present' : 'Missing');
    
    const response = await fetch(`${backendUrl}/api/statistics?timeRange=${timeRange}`, {
      headers: {
        'Cookie': cookieHeader || '',
        'Content-Type': 'application/json'
      }
    });

    console.log('Statistics API - Backend response status:', response.status);

    const result = await response.json();
    
    return NextResponse.json(result, { status: response.status });

  } catch (error) {
    console.error('Frontend statistics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
