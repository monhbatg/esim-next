import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Call the backend /api/marketplace endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Extract query parameters from request
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const regionId = searchParams.get('region_id');
    const search = searchParams.get('search');

    // Build query string
    const queryParams = new URLSearchParams();
    if (categoryId) queryParams.append('category_id', categoryId);
    if (regionId) queryParams.append('region_id', regionId);
    if (search) queryParams.append('search', search);

    const backendUrl = `${apiUrl}/api/marketplace${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data, or use 'force-cache' for caching
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

    const marketplaceData = await response.json();

    // Return the marketplace data in the expected format
    return NextResponse.json({
      success: true,
      data: marketplaceData,
    });

  } catch (error) {
    console.error('Get marketplace API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while fetching marketplace data';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

