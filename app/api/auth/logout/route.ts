import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Call the backend logout endpoint
    // This would typically call your backend API to invalidate the token/session
    // For now, we'll just return success since the frontend will handle clearing local storage
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If backend logout fails, we'll still proceed with frontend logout
      // but log the error
      console.error('Backend logout failed:', await response.text());
    }

    // Return success - the frontend will handle clearing local storage
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout API error:', error);

    // Even if there's an error, return success so frontend can clear local storage
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}
