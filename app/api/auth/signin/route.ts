import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get API URL from environment, default to localhost:3001
    // Note: In server-side API routes, we can access NEXT_PUBLIC_ variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Backend endpoint is /api/auth/signin
    const backendUrl = `${apiUrl}/api/auth/signin`;
    
    console.log('[Signin API Route] Environment check:');
    console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('  Using API URL:', apiUrl);
    console.log('  Calling backend:', backendUrl);

    // Call the backend login endpoint
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message ||
        errorData.error ||
        `HTTP error! status: ${response.status}`;
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const authData = await response.json();

    // Return the auth data (token, user info, etc.)
    return NextResponse.json(authData);

  } catch (error) {
    console.error('Signin API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred during signin';

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to connect to the server. Please check if the API server is running and NEXT_PUBLIC_API_URL is correctly configured.' 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

