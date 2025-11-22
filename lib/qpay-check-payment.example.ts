/**
 * QPay Invoice Status Check - Implementation Example
 * 
 * This file demonstrates how to implement the QPay invoice status check
 * with recommended polling strategy and error handling.
 */

/**
 * QPay Check Response from Backend
 */
interface QPayCheckResponse {
  success: boolean;
  data?: {
    status: 'PAID' | 'PENDING';
    orderId: string;
    paid_amount?: number;
    payment_details?: {
      payment_id: string;
      payment_status: string;
      payment_date: string;
      payment_fee: number;
      payment_currency: string;
    };
    count?: number;
  };
  error?: string;
}

/**
 * Polling configuration
 */
interface PollingConfig {
  interval: number; // Polling interval in milliseconds (default: 3000ms = 3s)
  timeout: number; // Maximum polling time in milliseconds (default: 300000ms = 5min)
  onSuccess: (data: QPayCheckResponse['data']) => void;
  onError: (error: string) => void;
  onTimeout: () => void;
  onPending?: (data: QPayCheckResponse['data']) => void;
}

/**
 * Check QPay invoice status
 * 
 * @param invoiceId - The QPay invoice ID
 * @returns Promise with the payment status
 */
export async function checkQPayInvoiceStatus(
  invoiceId: string
): Promise<QPayCheckResponse> {
  try {
    const response = await fetch('/api/guest/check-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: invoiceId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to check payment status');
    }

    return result;
  } catch (error) {
    console.error('Check payment error:', error);
    throw error;
  }
}

/**
 * Start polling for payment status
 * 
 * This function implements the recommended polling strategy:
 * - Polls every 3-5 seconds
 * - Stops when payment is PAID
 * - Stops after 5 minutes timeout
 * - Provides callbacks for different states
 * 
 * @param invoiceId - The QPay invoice ID
 * @param config - Polling configuration
 * @returns Function to stop polling
 */
export function startPaymentPolling(
  invoiceId: string,
  config: PollingConfig
): () => void {
  const {
    interval = 3000,
    timeout = 300000,
    onSuccess,
    onError,
    onTimeout,
    onPending,
  } = config;

  let pollInterval: NodeJS.Timeout | null = null;
  let timeoutTimer: NodeJS.Timeout | null = null;
  let isPolling = true;
  const startTime = Date.now();

  const cleanup = () => {
    isPolling = false;
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
  };

  const poll = async () => {
    if (!isPolling) return;

    // Check if timeout has been reached
    const elapsed = Date.now() - startTime;
    if (elapsed >= timeout) {
      cleanup();
      onTimeout();
      return;
    }

    try {
      const result = await checkQPayInvoiceStatus(invoiceId);

      if (!result.success) {
        cleanup();
        onError(result.error || 'Failed to check payment status');
        return;
      }

      if (result.data?.status === 'PAID') {
        cleanup();
        onSuccess(result.data);
      } else if (result.data?.status === 'PENDING') {
        // Payment is still pending, continue polling
        if (onPending) {
          onPending(result.data);
        }
      }
    } catch (error) {
      cleanup();
      onError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while checking payment status'
      );
    }
  };

  // Start polling immediately
  poll();

  // Set up interval for subsequent polls
  pollInterval = setInterval(poll, interval);

  // Set up timeout timer
  timeoutTimer = setTimeout(() => {
    if (isPolling) {
      cleanup();
      onTimeout();
    }
  }, timeout);

  // Return function to stop polling
  return cleanup;
}

/**
 * Example usage in a React component:
 * 
 * ```tsx
 * const [isChecking, setIsChecking] = useState(false);
 * const [error, setError] = useState('');
 * 
 * useEffect(() => {
 *   if (!paymentDetails?.invoice_id) return;
 *   
 *   setIsChecking(true);
 *   
 *   const stopPolling = startPaymentPolling(
 *     paymentDetails.invoice_id,
 *     {
 *       interval: 3000, // Check every 3 seconds
 *       timeout: 300000, // Stop after 5 minutes
 *       onSuccess: (data) => {
 *         setIsChecking(false);
 *         window.location.href = `/guest/success?orderId=${data.orderId}`;
 *       },
 *       onError: (error) => {
 *         setIsChecking(false);
 *         setError(error);
 *       },
 *       onTimeout: () => {
 *         setIsChecking(false);
 *         setError('Payment check timed out. Please verify your payment manually.');
 *       },
 *       onPending: (data) => {
 *         console.log('Payment still pending...', data);
 *       },
 *     }
 *   );
 *   
 *   // Cleanup on unmount
 *   return () => stopPolling();
 * }, [paymentDetails?.invoice_id]);
 * ```
 */

/**
 * Example: Manual check button (without polling)
 * 
 * ```tsx
 * const handleManualCheck = async () => {
 *   if (!paymentDetails?.invoice_id) return;
 *   
 *   setIsSubmitting(true);
 *   setError('');
 *   
 *   try {
 *     const result = await checkQPayInvoiceStatus(paymentDetails.invoice_id);
 *     
 *     if (!result.success) {
 *       throw new Error(result.error || 'Failed to check payment status');
 *     }
 *     
 *     if (result.data?.status === 'PAID') {
 *       window.location.href = `/guest/success?orderId=${result.data.orderId}`;
 *     } else {
 *       setError('Payment not yet completed. Please complete the payment and try again.');
 *     }
 *   } catch (error) {
 *     console.error('Check payment error:', error);
 *     setError('Failed to check payment status. Please try again.');
 *   } finally {
 *     setIsSubmitting(false);
 *   }
 * };
 * ```
 */

