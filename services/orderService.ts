import api from './api';
import { Order, CreateOrderRequest, UpdateOrderStatusRequest } from '@/types/order.types';

export const orderService = {
  async createOrder(data: CreateOrderRequest): Promise<{ success: boolean; order: Order }> {
    try {
      const response = await api.post('/orders', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  async getMyOrders(): Promise<{ success: boolean; orders: Order[] }> {
    try {
      const response = await api.get('/orders/my');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  async getStoreOrders(storeId: string): Promise<{ success: boolean; orders: Order[] }> {
    try {
      const response = await api.get(`/orders/store/${storeId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; order: Order }> {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order');
    }
  },

  async cancelOrder(orderId: string): Promise<{ success: boolean; order: Order }> {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },
};
