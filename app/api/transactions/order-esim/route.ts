import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, packageInfoList, transactionId, periodNum } = body;

    // Validate required fields
    if (!amount || !packageInfoList || !Array.isArray(packageInfoList) || packageInfoList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Amount and packageInfoList are required' },
        { status: 400 }
      );
    }

    // Validate packageInfoList structure
    for (const pkg of packageInfoList) {
      if (!pkg.packageCode || !pkg.count || !pkg.price) {
        return NextResponse.json(
          { success: false, error: 'Each package must have packageCode, count, and price' },
          { status: 400 }
        );
      }
    }

    // Get authentication token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendUrl = `${apiUrl}/api/transactions/order-esim`;

    // Prepare request body
    const requestBody: {
      amount: unknown;
      packageInfoList: unknown[];
      transactionId?: string | number;
      periodNum?: number;
    } = {
      amount,
      packageInfoList,
    };

    if (transactionId) {
      requestBody.transactionId = transactionId;
    }

    if (periodNum) {
      requestBody.periodNum = periodNum;
    }

    // Call the backend order endpoint
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
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

    // Return the order response
    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('Order eSIM API error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while placing the order';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

