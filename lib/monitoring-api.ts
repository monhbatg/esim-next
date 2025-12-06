import { api } from "./api";

interface Transaction {
  itemCounter: number;
  transactionDate: string;
  packageName: string;
  transactionType: string;
  customerPhone: string;
  customerMail: string
  supplyAmount: number;
  supplyAmountMNT: number;
  buyAmountWithTax: number;
  buyAmountWithoutTax: number;
  pureAmount: number;
}
// Type definitions for data
interface DashboardData {
  totalOrders: {
    amount: number;
    count: number;
  };
  baseOrders: {
    amount: number;
    count: number;
  };
  topUpOrders: {
    amount: number;
    count: number;
  };
  rangedTransactionCount: number;
  rangedTransactions: Transaction[];
  rangedTranPriecUSD: number;
  rangedTranPriceMNT: number;
  rangedTranWithTax: number;
  rangedTranWithoutTax: number;
  rangedTranPureAmount: number;
}

interface SalaryPreData {
  rangedTranPriecUSD: number;
  rangedTranPriceMNT: number;
  rangedTranWithTax: number;
  rangedTranWithoutTax: number;
  rangedTranPureAmount: number;
  startDate: string;
  endDate:string;
}

interface SalaryFinal {
  totalFinalProfit : number;
  investmentTaxPercent : number;
  investmentTaxAmount : number;
  operatorsSalaryDetail : number;
  totalOperatorSalary : number;
  developerSalaryDetail : DeveloperDetail[];
  totalDeveloperSalary : number;
  totalAdminSalary: number;
}

interface DeveloperDetail {
  developer: string;
  salaryPercen:  string;
  salary: number
}

interface BackendResponse {
  totalFinalProfit: number;
  investmentTaxPercent: string;
  investmentTaxAmount: number;
  operatorsSalaryDetail: { operatorName: string; operatorSalary: number }[];
  totalOperatorSalary: number;
  developerSalaryDetail: { developer: string; salaryPercen: string; salary: number }[];
  totalDeveloperSalary: number;
  totalAdminSalary: number;
}

interface SettingsReferenceData {
  id: string;
  module: string;
  key: string;
  type: string;
  value: string;
  description: string;
  statusCode: number
}

interface updateReference { 
  id: string,
  value: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string;
  message: string;
  statusCode: number;
}

export const monitoringApi = {
    getMonitoring: async (timePeriod?: String): Promise<DashboardData> => {
        const params = new URLSearchParams();
        if (timePeriod) {
          params.append('timeRange',timePeriod.toString());
        }
        const url = `/api/users/getDashboard/${timePeriod}`;
        const response = await api.get<DashboardData>(url);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch marketplace data');
        }
        return response.data;
    },
    getSalaryPre: async (): Promise<SalaryPreData> => {
        const url = `/api/users/calculateSalaryPre`;
        const response = await api.get<SalaryPreData>(url);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch marketplace data');
        }
        return response.data;
    },
    calculateSalaryFinal: async(profit:number,loss: number,description: string): Promise<BackendResponse> => {
      const backendRequestBody = {
        profit: profit,
        loss: loss,
        description: description || "Хугацааны урсгал зардал",
      };
      const url = `api/users/calculateSalaryFinal`;
      const response = await api.post<BackendResponse>(url,backendRequestBody);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch marketplace data');
        }
        return response.data;
    },
    getSettingsReference: async(): Promise<SettingsReferenceData[]> => {
      const url = `api/users/getReference`;
      const response = await api.get<SettingsReferenceData[]>(url);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch marketplace data');
        }
        return response.data;
    },
    updateSettingsReference: async (id: string, newValue: string): Promise<SettingsReferenceData[]> => {
      const updateReferenceBody = {
        id: id, // Ensure that the `id` is passed correctly, you had `IdleDeadline` which seems to be a mistake.
        value: newValue,
      };
      const url = `api/users/update/reference`;
      // Make the API request
      const response = await api.post<ApiResponse<SettingsReferenceData[]>>(url, updateReferenceBody);
      // Check for success status (HTTP 201)
      if (response.success === true && response.data ) {
        return response.data.data; // Return the data when status code is 201
      }else{
        throw new Error(response.message);
      }
    }
}