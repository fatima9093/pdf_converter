import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      toolType,
      originalFileName,
      fileSize,
      userId,
      processingLocation
    } = body;

    // Validate required fields
    if (!toolType || !originalFileName || !fileSize || !processingLocation) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get auth header to forward to backend
    const authHeader = request.headers.get('authorization');

    // Forward to backend tracking API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';
    const response = await fetch(`${backendUrl}/api/track-conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authHeader || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'user-agent': request.headers.get('user-agent') || ''
      },
      body: JSON.stringify({
        ...body,
        userId: userId || undefined // Let backend handle user ID extraction if not provided
      })
    });

    const result = await response.json();
    
    return NextResponse.json(result, { status: response.status });

  } catch (error) {
    console.error('Frontend tracking API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track conversion' },
      { status: 500 }
    );
  }
}
