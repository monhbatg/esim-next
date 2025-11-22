import { useState, useEffect, useRef } from 'react';

/**
 * QPay Invoice Status Check Response
 */
interface QPayCheckResponse {
  count: number;
  paid_amount?: number;
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
 * Payment status check result
 */
interface PaymentStatusResult {
  success: boolean;
  data?: {
    status: 'NEW' | 'FAILED' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'PENDING';
    orderId?: string;
    orderNo?: string;
    paid_amount?: number;
    payment_details?: QPayCheckResponse['rows'][0];
    count?: number;
  };
  error?: string;
}

/**
 * Options for invoice status polling
 */
interface PollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 3000)
  timeout?: number; // Maximum polling duration in milliseconds (default: 300000 = 5 minutes)
  enabled?: boolean; // Whether polling is enabled (default: true)
  onStatus?: (result: PaymentStatusResult) => void; // Callback for each check
  onSuccess?: (result: PaymentStatusResult) => void; // Callback when payment is confirmed
  onError?: (error: Error) => void; // Callback for errors
  onTimeout?: () => void; // Callback when timeout is reached
}

/**
 * Hook return type
 */
interface UseInvoiceStatusReturn {
  status: PaymentStatusResult | null;
  loading: boolean;
  error: string | null;
  isPaid: boolean;
  isPolling: boolean;
  stopPolling: () => void;
  startPolling: () => void;
  checkStatus: () => Promise<void>;
}

/**
 * Check invoice payment status
 * Implements the guide's checkInvoiceStatus function pattern
 * 
 * @param invoiceId - QPay invoice ID
 * @returns Promise with payment status result
 */
async function checkInvoiceStatus(invoiceId: string): Promise<PaymentStatusResult> {
  try {
    const response = await fetch('/api/guest/check-payment', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        identifier: invoiceId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error cases as per guide
      const errorMessage = result.error || 'Failed to check payment status';
      
      // Return error with status information
      return {
        success: false,
        error: errorMessage,
      };
    }

    return result as PaymentStatusResult;
  } catch (error) {
    // Handle network errors and other exceptions
    // According to guide: implement retry logic for transient errors
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while checking payment status';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * React hook for polling QPay invoice status
 * 
 * @param invoiceId - QPay invoice ID to check
 * @param options - Polling configuration options
 * @returns Invoice status state and control functions
 * 
 * @example
 * ```tsx
 * const { isPaid, loading, error, stopPolling } = useInvoiceStatus(invoiceId, {
 *   interval: 3000,
 *   timeout: 300000,
 *   onSuccess: (result) => {
 *     router.push(`/guest/success?orderId=${result.data?.orderId}`);
 *   },
 * });
 * ```
 */
export function useInvoiceStatus(
  invoiceId: string | null,
  options: PollingOptions = {}
): UseInvoiceStatusReturn {
  const {
    interval = 3000,
    timeout = 300000,
    enabled = true,
    onStatus,
    onSuccess,
    onError,
    onTimeout,
  } = options;

  const [status, setStatus] = useState<PaymentStatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
    startTimeRef.current = null;
  };

  const startPolling = () => {
    if (!invoiceId || isPollingRef.current) return;

    isPollingRef.current = true;
    setIsPolling(true);
    startTimeRef.current = Date.now();

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      if (onTimeout) {
        onTimeout();
      }
    }, timeout);

    // Initial check
    const performCheck = async () => {
      // Check timeout
      if (startTimeRef.current && Date.now() - startTimeRef.current > timeout) {
        stopPolling();
        if (onTimeout) {
          onTimeout();
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await checkInvoiceStatus(invoiceId);

        setStatus(result);
        
        // Call status callback if provided
        if (onStatus) {
          onStatus(result);
        }

        // Check if paid - according to guide: count > 0 and payment_status === 'PAID'
        if (
          result.success &&
          result.data?.status === 'PAID'
        ) {
          setIsPaid(true);
          stopPolling();
          
          if (onSuccess) {
            onSuccess(result);
          }
        } else if (
          result.success &&
          (result.data?.status === 'FAILED' || result.data?.status === 'REFUNDED')
        ) {
          // Stop polling for failed or refunded payments
          stopPolling();
          if (onError) {
            onError(new Error(`Payment status: ${result.data.status}`));
          }
        } else if (result.error) {
          setError(result.error);
          
          // Stop polling on auth errors (as per guide: stop on 401 Unauthorized)
          if (
            result.error.includes('Unauthorized') || 
            result.error.includes('401') ||
            result.error.toLowerCase().includes('authentication')
          ) {
            stopPolling();
            if (onError) {
              onError(new Error(result.error));
            }
          }
          // For other errors, continue polling (transient errors may resolve)
          // Guide recommends retry logic for network errors
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setLoading(false);
      }
    };

    // Perform initial check
    performCheck();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      if (isPollingRef.current) {
        performCheck();
      }
    }, interval);
  };

  const checkStatus = async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await checkInvoiceStatus(invoiceId);
      setStatus(result);

      if (result.success && result.data?.status === 'PAID') {
        setIsPaid(true);
        if (onSuccess) {
          onSuccess(result);
        }
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-start polling when enabled and invoiceId is available
  useEffect(() => {
    if (enabled && invoiceId && !isPollingRef.current) {
      startPolling();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      stopPolling();
    };
  }, [enabled, invoiceId]);

  // Stop polling when paid
  useEffect(() => {
    if (isPaid && isPollingRef.current) {
      stopPolling();
    }
  }, [isPaid]);

  return {
    status,
    loading,
    error,
    isPaid,
    isPolling,
    stopPolling,
    startPolling,
    checkStatus,
  };
}

