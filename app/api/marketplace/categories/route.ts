import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Call the backend /api/marketplace/categories endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const backendUrl = `${apiUrl}/api/marketplace/categories`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
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

    const categoriesData = await response.json();

    // Return the categories data in the expected format
    return NextResponse.json({
      success: true,
      data: categoriesData,
    });

  } catch (error) {
    console.error('Get categories API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while fetching categories';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

