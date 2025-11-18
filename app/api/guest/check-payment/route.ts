import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier } = body;

    // Validate required fields
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Phone number or email is required' },
        { status: 400 }
      );
    }

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendUrl = `${apiUrl}/api/guest/check-payment`;

    // Call the backend check-payment endpoint
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ identifier: identifier.trim() }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        responseData.message ||
        responseData.error ||
        `HTTP error! status: ${response.status}`;

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    // Return the payment status
    return NextResponse.json({
      success: true,
      data: {
        status: responseData.status || 'PENDING',
        orderId: responseData.orderId || responseData.id,
        qrCode: responseData.qrCode,
        iccid: responseData.iccid,
        smdp: responseData.smdp || responseData.smDpAddress,
        activationCode: responseData.activationCode || responseData.activation_code,
      },
    });

  } catch (error) {
    console.error('Check payment API error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while checking payment status';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

