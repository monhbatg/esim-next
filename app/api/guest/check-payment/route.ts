import { NextRequest, NextResponse } from 'next/server';

/**
 * QPay Invoice Status Check Response
 * Matches the QPay payment/check API response structure
 */
interface QPayCheckResponse {
  count: number;
  paid_amount?: number;
  orderNo?: string;
  orderId?: string;
  rows: Array<{
    payment_id: string;
    payment_status: string;
    payment_date: string;
    payment_fee: number;
    payment_currency: string;
    invoice_id?: string;
  }>;
}

/**
 * Backend error response structure
 */
interface BackendErrorResponse {
  statusCode?: number;
  message?: string;
  error?: string;
}

/**
 * POST /api/guest/check-payment
 * 
 * Checks QPay invoice payment status by calling the backend endpoint.
 * According to the guide, the backend endpoint requires JWT Bearer Token,
 * but for guest checkout, we'll attempt to include it if available.
 * 
 * @param request - Next.js request object
 * @returns Payment status response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier } = body;

    // Validate required fields (identifier is the invoice_id from QPay)
    if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invoice ID is required' 
        },
        { status: 400 }
      );
    }

    const invoiceId = identifier.trim();

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendUrl = `${apiUrl}/api/transactions/check/${invoiceId}`;

    // Get authorization token from request headers (if available)
    // For guest checkout, token might not be present, but backend may still accept it
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Include authorization header if available (as per guide specification)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      headers['Authorization'] = authHeader;
    }

    // Call the backend QPay invoice status check endpoint
    // According to guide: POST /transactions/check/:invoiceId
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
    });

    // Handle different response status codes as per guide
    if (!response.ok) {
      let errorData: BackendErrorResponse = {};
      
      try {
        errorData = await response.json() as BackendErrorResponse;
      } catch {
        // If response is not JSON, use status text
        errorData = { message: `HTTP error! status: ${response.status}` };
      }

      // Map backend error responses to match guide specifications
      const errorMessage = 
        errorData.message || 
        errorData.error || 
        `HTTP error! status: ${response.status}`;

      // Return appropriate error response based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false, 
            error: errorMessage || 'Unauthorized' 
          },
          { status: 401 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json(
          { 
            success: false, 
            error: errorMessage || 'Invalid invoice ID' 
          },
          { status: 400 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            error: errorMessage || 'Invoice not found' 
          },
          { status: 404 }
        );
      }

      // For other errors (500, etc.)
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage 
        },
        { status: response.status }
      );
    }

    // Parse QPay response
    let responseData: QPayCheckResponse;
    try {
      responseData = await response.json() as QPayCheckResponse;
    } catch (parseError) {
      console.error('Failed to parse QPay response:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid response from payment service' 
        },
        { status: 500 }
      );
    }

    // Validate response structure
    if (typeof responseData.count !== 'number' || !Array.isArray(responseData.rows)) {
      console.error('Invalid QPay response structure:', responseData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid response format from payment service' 
        },
        { status: 500 }
      );
    }

    // Determine payment status based on QPay response structure
    // Map QPay payment_status to our status values: NEW, FAILED, PAID, PARTIAL, REFUNDED, PENDING
    let paymentStatus: 'NEW' | 'FAILED' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'PENDING' = 'PENDING';
    
    if (responseData.count === 0) {
      // No payments found - invoice is NEW (created but not paid)
      paymentStatus = 'NEW';
    } else if (responseData.rows.length > 0) {
      // Check payment status from rows
      const firstRow = responseData.rows[0];
      const status = firstRow.payment_status?.toUpperCase();
      
      // Map QPay status to our status values
      if (status === 'PAID') {
        paymentStatus = 'PAID';
      } else if (status === 'FAILED' || status === 'CANCELLED') {
        paymentStatus = 'FAILED';
      } else if (status === 'PARTIAL' || status === 'PARTIALLY_PAID') {
        paymentStatus = 'PARTIAL';
      } else if (status === 'REFUNDED' || status === 'REFUND') {
        paymentStatus = 'REFUNDED';
      } else if (status === 'NEW' || status === 'CREATED') {
        paymentStatus = 'NEW';
      } else {
        // Default to PENDING for unknown statuses
        paymentStatus = 'PENDING';
      }
      
      // Check if there are multiple payments with different statuses
      const hasPartial = responseData.rows.some(row => 
        row.payment_status?.toUpperCase() === 'PARTIAL' || 
        row.payment_status?.toUpperCase() === 'PARTIALLY_PAID'
      );
      if (hasPartial && paymentStatus !== 'PAID') {
        paymentStatus = 'PARTIAL';
      }
    }

    // Get the most relevant payment row for details
    const paymentRow = responseData.rows.find(row => 
      row.payment_status?.toUpperCase() === 'PAID' ||
      row.payment_status?.toUpperCase() === 'PARTIAL' ||
      row.payment_status?.toUpperCase() === 'PARTIALLY_PAID'
    ) || responseData.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        status: paymentStatus,
        orderId: invoiceId,
        orderNo: responseData.orderNo || responseData.orderId || invoiceId,
        paid_amount: responseData.paid_amount || 0,
        count: responseData.count,
        payment_details: paymentRow ? {
          payment_id: paymentRow.payment_id,
          payment_status: paymentRow.payment_status,
          payment_date: paymentRow.payment_date,
          payment_fee: paymentRow.payment_fee,
          payment_currency: paymentRow.payment_currency,
          invoice_id: paymentRow.invoice_id || invoiceId,
        } : undefined,
        // Include raw QPay response for reference
        qpay_response: {
          count: responseData.count,
          paid_amount: responseData.paid_amount,
        },
      },
    });

  } catch (error) {
    console.error('Check payment API error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while checking payment status';

    // Return 500 error as per guide specification
    return NextResponse.json(
      { 
        success: false, 
        error: `Error checking invoice: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}

