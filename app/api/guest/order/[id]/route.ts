import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendUrl = `${apiUrl}/api/guest/order/${orderId}`;

    // Call the backend order endpoint
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
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

    // Return the order data
    return NextResponse.json({
      success: true,
      data: {
        orderId: responseData.orderId || responseData.id || orderId,
        status: responseData.status || 'PENDING',
        qrCode: responseData.qrCode,
        iccid: responseData.iccid,
        smdp: responseData.smdp || responseData.smDpAddress,
        activationCode: responseData.activationCode || responseData.activation_code,
        plan: responseData.plan,
      },
    });

  } catch (error) {
    console.error('Get order API error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while fetching order';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

