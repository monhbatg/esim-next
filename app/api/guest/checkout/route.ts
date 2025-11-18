import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, email, plan } = body;

    // Validate required fields
    if (!phone || !email || !plan) {
      return NextResponse.json(
        { success: false, error: 'Phone, email, and plan are required' },
        { status: 400 }
      );
    }

    if (!plan.packageCode || !plan.price) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan data' },
        { status: 400 }
      );
    }

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendUrl = `${apiUrl}/api/guest/checkout`;

    // Prepare request body for backend
    const requestBody = {
      phone: phone.trim(),
      email: email.trim(),
      packageCode: plan.packageCode,
      amount: plan.retailPrice || plan.price,
      price: plan.price,
    };

    // Call the backend guest checkout endpoint
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
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

    // Return the checkout response (should include paymentUrl and orderId)
    return NextResponse.json({
      success: true,
      data: {
        orderId: responseData.orderId || responseData.id,
        paymentUrl: responseData.paymentUrl || responseData.qpayUrl,
        status: responseData.status || 'PENDING',
      },
    });

  } catch (error) {
    console.error('Guest checkout API error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while processing checkout';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

