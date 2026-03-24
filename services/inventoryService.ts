import api from './api';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/inventory.types';

export const inventoryService = {
  async getStoreProducts(storeId: string, filters?: { category?: string; search?: string; inStock?: boolean }): Promise<{ success: boolean; products: Product[]; total: number }> {
    try {
      const response = await api.get(`/products/store/${storeId}`, { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  async addProduct(data: CreateProductRequest): Promise<{ success: boolean; product: Product }> {
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add product');
    }
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<{ success: boolean; product: Product }> {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  async adjustStock(productId: string, type: 'IN' | 'OUT', quantity: number, reason: string, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/products/${productId}/adjust-stock`, { type, quantity, reason, notes });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to adjust stock');
    }
  },

  async getSalesHistory(productId: string): Promise<{ success: boolean; history: any[] }> {
    try {
      const response = await api.get(`/products/${productId}/sales-history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sales history');
    }
  },
};
