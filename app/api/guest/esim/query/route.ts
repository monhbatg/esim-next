import { NextRequest, NextResponse } from 'next/server';

/**
 * Query eSIM details from the backend
 * This endpoint proxies to the backend /api/v1/open/esim/query endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNo, esimTranNo, iccid, startTime, endTime, pager } = body;

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendUrl = `${apiUrl}/api/v1/open/esim/query`;

    // Prepare request body for backend
    const requestBody: Record<string, unknown> = {};
    
    if (orderNo) requestBody.orderNo = orderNo;
    if (esimTranNo) requestBody.esimTranNo = esimTranNo;
    if (iccid) requestBody.iccid = iccid;
    if (startTime) requestBody.startTime = startTime;
    if (endTime) requestBody.endTime = endTime;
    if (pager) requestBody.pager = pager;

    // Call the backend eSIM query endpoint
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
        responseData.errorMsg ||
        responseData.message ||
        responseData.error ||
        `HTTP error! status: ${response.status}`;

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    // Return the eSIM query response
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('eSIM query API error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

