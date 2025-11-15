import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phoneNumber } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Get API URL from environment, default to localhost:3001
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Try /api/auth/signup first, fallback to /auth/signup if needed
    const backendUrl = `${apiUrl}/api/auth/signup`;
    
    console.log('Signup API Route - Calling backend:', backendUrl);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

    // Call the backend signup endpoint
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
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
    console.error('Signup API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred during signup';

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

