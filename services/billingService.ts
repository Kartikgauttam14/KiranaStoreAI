import api from './api';
import { Bill, CreateBillRequest } from '@/types/billing.types';

export const billingService = {
  async createBill(data: CreateBillRequest): Promise<{ success: boolean; bill: Bill }> {
    try {
      const response = await api.post('/bills', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create bill');
    }
  },

  async getStoreBills(storeId: string, filters?: { from?: string; to?: string; paymentMode?: string }): Promise<{ success: boolean; bills: Bill[]; total: number }> {
    try {
      const response = await api.get(`/bills/store/${storeId}`, { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bills');
    }
  },

  async getBillDetail(billId: string): Promise<{ success: boolean; bill: Bill }> {
    try {
      const response = await api.get(`/bills/${billId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bill');
    }
  },

  async generateBillPDF(billId: string): Promise<{ success: boolean; pdfUrl: string }> {
    try {
      const response = await api.get(`/bills/${billId}/pdf`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate PDF');
    }
  },
};
