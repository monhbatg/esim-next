import { api } from "./api";

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
}



export const operatorApi = {
    getInvoices: async (): Promise<InvoiceResponse> => {
        const url = `/api/users/invoices`;
        const response = await api.get<InvoiceResponse>(url);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch invoices data');
        }
        return response.data;
    }
}