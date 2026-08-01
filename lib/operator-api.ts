import { PackageLocationNetwork } from "@/types";
import { api } from "./api";
import { get } from "http";

interface InvoiceResponse {
  success: boolean;
  data: InvoiceItem[];
}

interface InvoiceItem {
  invoice_id: string;
  invoice_amount: number;
  invoice_qpayInvoiceId: string;
  invoice_status: "PENDING" | "PAID" | "FAILED" | "CANCELLED"; // extend if needed
  customer_email: string;
  customer_phoneNumber: string;
  invoice_createdAt: string; // ISO date string
  package_name: string;
  invoice_iccId: string; // Added iccId field
}

interface EsimPackage {
  packageCode: string;
  slug: string;
  name: string;
  price: number;
  currencyCode: string;
  volume: number; // in MB
  smsStatus: number;
  dataType: number;
  unusedValidTime: number;
  duration: number;
  durationUnit: string;
  location: string;
  description: string;
  buyPrice: number;
  activeType: number;
  favorite: boolean;
  retailPrice: number;
  speed?: string;
  locationNetworkList?: PackageLocationNetwork[];
}

interface PurchaseOrderRequest {
  packageCode: string;
  email: string;
  phoneNumber: string;
  amount: number;
  description: string;
}

interface PackageResponse {
  invoice_id: string;
  internalInvoiceId: string;
  qr_image: string;
}


export interface PaymentStatusResponse {
  count: number;
  paid_amount?: number;
  rows: PaymentRow[];
  orderPlaced: boolean;
  orderNo: string | null;
  transactionId?: string;
  message: string;
}

export interface PaymentRow {
  payment_id: string;
  payment_status: "PAID" | "PENDING" | "FAILED";
  payment_amount: string;
  ebarimt_customer_no: string | null;
  trx_fee: string;
  payment_currency: string;
  payment_wallet: string;
  payment_type: string;
  next_payment_date: string | null;
  next_payment_datetime: string | null;
  card_transactions: any[]; // you can refine later if needed
  p2p_transactions: P2PTransaction[];
}

export interface P2PTransaction {
  id: string;
  transaction_bank_code: string;
  account_bank_code: string;
  account_bank_name: string;
  account_number: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: string;
  currency: string;
  settlement_status: "SETTLED" | "PENDING";
}


export const operatorApi = {
    getInvoices: async (): Promise<InvoiceResponse> => {
        const url = `/api/users/invoices`;
        const response = await api.get<InvoiceResponse>(url);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch invoices data');
        }
        return response.data;
    },

    getPackages: async (): Promise<EsimPackage[]> => {
        const url = `/api/inquiry/localPackages`;
        const response = await api.get<EsimPackage>(url);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch packages data');
        }
        // Extract packages array
      const packages: EsimPackage[] = Array.isArray(response.data) ? response.data : [];
      return packages;
    },

    //create purchase order API can be added here
    getPurchaseOrders: async (payload: PurchaseOrderRequest): Promise<PackageResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const url = `${apiUrl}/api/customer/transactions/purchase`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create purchase order');
      }
      return response.json();
    },


    /**
     * Check payment using invoice ID
     */
    checkPaymentStatus: async (invoiceId: string): Promise<PaymentStatusResponse> => {
      const response = await api.post<PaymentStatusResponse>(
        `/api/users/check-payment/${invoiceId}`, // ✅ pass as param
        {}, // ✅ empty body
        {
          // ⚠️ remove skipAuth if endpoint requires token
        }
      );
    
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to check payment status');
      }
    
      return response.data;
    },

    /**
     * Cancel payment using transaction number
     */
    cancelPayment: async (transNo: string): Promise<PaymentStatusResponse> => {
      const response = await api.post<PaymentStatusResponse>(
        `/api/esim/action/1/transno/${transNo}`, // ✅ pass as param
        {}, // ✅ empty body
        {
          // ⚠️ remove skipAuth if endpoint requires token
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to check payment status');
      }
    
      return response.data;
    }

}