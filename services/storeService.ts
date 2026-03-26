import api from './api';
import { Store, CreateStoreRequest, UpdateStoreRequest, NearbyStoresRequest } from '@/types/store.types';

export const storeService = {
  async createStore(data: CreateStoreRequest): Promise<{ success: boolean; store: Store }> {
    try {
      const response = await api.post('/stores', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create store');
    }
  },

  async getMyStores(): Promise<{ success: boolean; stores: Store[] }> {
    try {
      const response = await api.get('/stores/my');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stores');
    }
  },

  async getStore(id: string): Promise<{ success: boolean; store: Store }> {
    try {
      const response = await api.get(`/stores/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch store');
    }
  },

  async updateStore(id: string, data: UpdateStoreRequest): Promise<{ success: boolean; store: Store }> {
    try {
      const response = await api.put(`/stores/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update store');
    }
  },

  async deleteStore(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/stores/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete store');
    }
  },

  async getNearbyStores(lat: number, lng: number, radius = 5): Promise<{ success: boolean; stores: Store[]; total: number }> {
    try {
      const response = await api.get('/stores/nearby', {
        params: { lat, lng, radius },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch nearby stores');
    }
  },
};
