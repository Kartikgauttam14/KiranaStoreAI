import api from './api';

export interface DashboardStats {
  todayRevenue: number;
  ordersToday: number;
  lowStockItems: number;
  billsToday: number;
}

export interface WeeklySalesData {
  day: string;
  amount: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class AnalyticsService {
  /**
   * Get dashboard statistics for a store
   * GET /api/analytics/store/:storeId/dashboard
   */
  async getDashboardStats(storeId: string): Promise<DashboardStats> {
    try {
      const response = await api.get(`/analytics/store/${storeId}/dashboard`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to fetch dashboard stats');
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error.message);
      throw error;
    }
  }

  /**
   * Get weekly sales data for a store
   * GET /api/analytics/store/:storeId/weekly-sales
   */
  async getWeeklySalesData(storeId: string): Promise<WeeklySalesData[]> {
    try {
      const response = await api.get(`/analytics/store/${storeId}/weekly-sales`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to fetch weekly sales');
    } catch (error: any) {
      console.error('Error fetching weekly sales:', error.message);
      throw error;
    }
  }

  /**
   * Get low stock items for a store
   * GET /api/analytics/store/:storeId/low-stock
   */
  async getLowStockItems(storeId: string): Promise<LowStockItem[]> {
    try {
      const response = await api.get(`/analytics/store/${storeId}/low-stock`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to fetch low stock items');
    } catch (error: any) {
      console.error('Error fetching low stock items:', error.message);
      throw error;
    }
  }

  /**
   * Get sales by category for a store
   * GET /api/analytics/store/:storeId/category-sales
   */
  async getCategorySales(storeId: string) {
    try {
      const response = await api.get(`/analytics/store/${storeId}/category-sales`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to fetch category sales');
    } catch (error: any) {
      console.error('Error fetching category sales:', error.message);
      throw error;
    }
  }

  /**
   * Get total analytics for a time period
   * GET /api/analytics/store/:storeId/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  async getAnalyticsSummary(storeId: string, from?: string, to?: string) {
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await api.get(
        `/analytics/store/${storeId}/summary${params.toString() ? '?' + params.toString() : ''}`
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to fetch summary');
    } catch (error: any) {
      console.error('Error fetching analytics summary:', error.message);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
