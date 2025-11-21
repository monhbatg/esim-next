import { NextRequest, NextResponse } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Call the backend /api/marketplace/packages endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Extract query parameters from request
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('country_code');

    // Validate country_code parameter
    if (!countryCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'country_code parameter is required',
          statusCode: 400,
          message: ['country_code should not be empty', 'country_code must be a string'],
        },
        { status: 400 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('country_code', countryCode);

    const backendUrl = `${apiUrl}/api/inquiry/packages`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message ||
        errorData.error ||
        `HTTP error! status: ${response.status}`;
      
      return NextResponse.json(
        { success: false, error: errorMessage, statusCode: response.status },
        { status: response.status }
      );
    }

    const packagesData = await response.json();

    // Return the packages data in the expected format with no-cache headers
    return NextResponse.json(
      {
        success: true,
        data: packagesData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error) {
    console.error('Get packages API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while fetching packages';

    return NextResponse.json(
      { success: false, error: errorMessage, statusCode: 500 },
      { status: 500 }
    );
  }
}