import { api } from './api';

/**
 * Guest checkout request payload
 */
export interface GuestCheckoutRequest {
  phone: string;
  email: string;
  plan: {
    packageCode: string;
    price: number;
    retailPrice: number;
  };
}

/**
 * Guest checkout response data
 */
export interface GuestCheckoutResponse {
  orderId: string;
  paymentUrl: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
}

/**
 * Check payment status request
 */
export interface CheckPaymentRequest {
  identifier: string; // phone or email
}

/**
 * Payment status response
 */
export interface PaymentStatusResponse {
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  orderId?: string;
  qrCode?: string;
  iccid?: string;
  smdp?: string;
  activationCode?: string;
}

/**
 * Guest API
 * Handles guest checkout and payment status checking
 */
export const guestApi = {
  /**
   * Create a guest checkout and get QPay payment URL
   */
  checkout: async (data: GuestCheckoutRequest): Promise<GuestCheckoutResponse> => {
    const response = await api.post<GuestCheckoutResponse>(
      '/api/guest/checkout',
      {
        phone: data.phone,
        email: data.email,
        plan: data.plan,
      },
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create guest checkout');
    }

    return response.data;
  },

  /**
   * Check payment status by phone or email
   */
  checkPayment: async (identifier: string): Promise<PaymentStatusResponse> => {
    const response = await api.post<PaymentStatusResponse>(
      '/api/guest/check-payment',
      { identifier },
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to check payment status');
    }

    return response.data;
  },

  /**
   * Get order details by order ID
   */
  getOrder: async (orderId: string): Promise<PaymentStatusResponse & { plan?: any }> => {
    const response = await api.get<PaymentStatusResponse & { plan?: any }>(
      `/api/guest/order/${orderId}`,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch order');
    }

    return response.data;
  },

  /**
   * Search for purchased SIM cards by phone or email
   */
  searchSimCards: async (identifier: string): Promise<GuestSimCard[]> => {
    const response = await api.post<GuestSimCard[]>(
      '/api/guest/search-sim-cards',
      { identifier },
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to search SIM cards');
    }

    return response.data;
  },

  /**
   * Top up a SIM card (guest user)
   */
  topUpSimCard: async (data: GuestTopUpRequest): Promise<GuestTopUpResponse> => {
    const response = await api.post<GuestTopUpResponse>(
      '/api/guest/topup',
      data,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to top up SIM card');
    }

    return response.data;
  },
};

/**
 * Guest SIM Card interface
 */
export interface GuestSimCard {
  id: string;
  iccid: string;
  phoneNumber?: string;
  email: string;
  country: string;
  countryCode: string;
  flag: string;
  data: string;
  used: string;
  remaining: string;
  expiry: string;
  status: 'active' | 'expired' | 'pending';
  purchaseDate: string;
  planName?: string;
}

/**
 * Guest top-up request
 */
export interface GuestTopUpRequest {
  simCardId: string;
  identifier: string; // phone or email
  plan: {
    packageCode: string;
    price: number;
    retailPrice: number;
  };
}

/**
 * Guest top-up response
 */
export interface GuestTopUpResponse {
  orderId: string;
  paymentUrl: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  simCardId: string;
}

