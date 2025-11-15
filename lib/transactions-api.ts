import { api } from './api';

/**
 * Order eSIM request payload
 */
export interface OrderEsimRequest {
  amount: number;
  packageInfoList: Array<{
    packageCode: string;
    count: number;
    price: number;
  }>;
  transactionId?: string;
  periodNum?: number;
}

/**
 * Order eSIM response data
 */
export interface OrderEsimResponse {
  orderNo: string;
  transactionId: string;
  balanceBefore: number;
  balanceAfter: number;
}

/**
 * Transactions API
 * Handles eSIM ordering and transaction-related operations
 */
export const transactionsApi = {
  /**
   * Order an eSIM package
   * Places an order for one or more eSIM packages
   */
  orderEsim: async (data: OrderEsimRequest): Promise<OrderEsimResponse> => {
    const response = await api.post<OrderEsimResponse>(
      '/api/transactions/order-esim',
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to place eSIM order');
    }

    return response.data;
  },
};

