# QPay Invoice Status Check Implementation

## Overview

This document summarizes the implementation of the QPay invoice status check functionality according to the provided API specification.

## Changes Made

### 1. Backend API Route (`/app/api/guest/check-payment/route.ts`)

**Updated to call the new QPay invoice check endpoint:**

- **Endpoint**: `POST /api/transactions/check/:invoiceId`
- **Request**: Sends the invoice ID to check payment status
- **Response Structure**:
  ```typescript
  {
    count: number;
    paid_amount?: number;
    rows: Array<{
      payment_id: string;
      payment_status: string; // "PAID" or other statuses
      payment_date: string;
      payment_fee: number;
      payment_currency: string;
    }>;
  }
  ```

**Key Features:**
- Validates invoice ID before making the request
- Calls the backend endpoint: `/api/transactions/check/{invoiceId}`
- Checks if payment is PAID by examining `count > 0` and `payment_status === 'PAID'`
- Returns standardized response with `status: 'PAID'` or `status: 'PENDING'`
- Includes payment details when payment is successful

### 2. Frontend Implementation (`/app/guest/checkout/page.tsx`)

**Enhanced the "Check Payment Status" button with:**

- Loading state with spinner animation
- Better error handling with user-friendly messages
- Sets `isSubmitting` state to prevent multiple simultaneous checks
- Shows error messages in the UI instead of alerts
- Proper cleanup with `finally` block

**User Experience Improvements:**
- Visual feedback during check (spinner + "Checking payment..." text)
- Error messages displayed in the UI using the existing error state
- Prevents duplicate submissions with disabled button during check
- Redirects to success page only when payment is confirmed PAID

### 3. Localization Updates

**Added missing translation keys to all locale files:**

- `checkingPayment`: Translation for "Checking payment..." loading state
- Updated `paymentNotCompleted` message to include "try again" guidance
- Updated `checkPaymentError` message for better clarity

**Files Updated:**
- `/locales/en.ts` - English translations
- `/locales/mn.ts` - Mongolian translations  
- `/locales/zh.ts` - Chinese translations

### 4. Example Implementation (`/lib/qpay-check-payment.example.ts`)

**Created comprehensive example file with:**

- `checkQPayInvoiceStatus()` - Function to check payment status once
- `startPaymentPolling()` - Function to implement automatic polling
- Polling configuration options:
  - Interval: 3 seconds (default)
  - Timeout: 5 minutes (default)
  - Callbacks for success, error, timeout, and pending states
- Complete TypeScript interfaces for type safety
- Detailed usage examples in comments

**Recommended Polling Strategy:**
```typescript
// Poll every 3 seconds
// Stop when payment is PAID
// Stop after 5 minutes timeout
// Provide user feedback for each state
```

## API Specification Compliance

✅ **Endpoint**: Uses `POST /transactions/check/{invoiceId}` as specified  
✅ **Headers**: Sends `Content-Type: application/json` and `Accept: application/json`  
✅ **Response Handling**: Properly parses QPay response structure with `count`, `paid_amount`, and `rows`  
✅ **Status Detection**: Checks `payment_status === 'PAID'` to determine success  
✅ **Error Handling**: Handles 400, 401, 404, and 500 errors appropriately  

## Usage

### Manual Check (Current Implementation)

The user clicks "Check Payment Status" button:
1. Button shows loading state
2. Frontend calls `/api/guest/check-payment` with invoice ID
3. Backend forwards request to `/api/transactions/check/{invoiceId}`
4. Backend checks QPay response for PAID status
5. If PAID, user is redirected to success page
6. If PENDING, error message is shown

### Automatic Polling (Optional Enhancement)

To implement automatic polling, use the example code in `/lib/qpay-check-payment.example.ts`:

```tsx
import { startPaymentPolling } from '@/lib/qpay-check-payment.example';

// Start polling when QR code is displayed
useEffect(() => {
  if (!paymentDetails?.invoice_id) return;
  
  const stopPolling = startPaymentPolling(
    paymentDetails.invoice_id,
    {
      interval: 3000, // Check every 3 seconds
      timeout: 300000, // Stop after 5 minutes
      onSuccess: (data) => {
        window.location.href = `/guest/success?orderId=${data.orderId}`;
      },
      onError: (error) => {
        setError(error);
      },
      onTimeout: () => {
        setError('Payment check timed out. Please check manually.');
      },
    }
  );
  
  return () => stopPolling();
}, [paymentDetails?.invoice_id]);
```

## Testing

To test the implementation:

1. **Start a guest checkout**:
   - Select a plan from the marketplace
   - Choose "Continue as Guest"
   - Enter phone and email
   - Proceed to payment

2. **Generate QPay invoice**:
   - Click "Pay with QPay"
   - QR code should be displayed

3. **Test payment check**:
   - Click "Check Payment Status" button
   - Should see loading state
   - Before payment: Should show "Payment not yet completed" error
   - After payment: Should redirect to success page

## Backend Requirements

The backend must have the following endpoint available:

```
POST /api/transactions/check/{invoiceId}
```

This endpoint should:
- Accept the invoice ID as a URL parameter
- Return QPay response structure with `count`, `paid_amount`, and `rows`
- Handle authentication if required (for guest checkout, might not need auth)

## Security Considerations

- Invoice ID validation prevents injection attacks
- Error messages don't expose sensitive information
- Timeout prevents infinite polling
- Backend endpoint should rate-limit requests to prevent abuse

## Future Enhancements

1. **Auto-polling**: Implement automatic background polling for better UX
2. **Webhook**: Consider webhook callback from QPay for instant notifications
3. **Retry Logic**: Add exponential backoff for failed checks
4. **Analytics**: Track payment check success/failure rates
5. **Progress Indicator**: Show elapsed time while checking payment

## Files Modified

1. `/app/api/guest/check-payment/route.ts` - Backend API route
2. `/app/guest/checkout/page.tsx` - Frontend checkout page
3. `/locales/en.ts` - English translations
4. `/locales/mn.ts` - Mongolian translations
5. `/locales/zh.ts` - Chinese translations
6. `/lib/qpay-check-payment.example.ts` - Example implementation (new file)

## Summary

The implementation successfully integrates the QPay invoice status check API as specified in the documentation. The frontend provides a user-friendly interface for checking payment status, and the backend properly communicates with the QPay API endpoint. The example file provides guidance for implementing automatic polling if needed in the future.

