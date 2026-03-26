import api from './api';
import { Forecast } from '@/types/forecast.types';

export const forecastService = {
  async generateProductForecast(productId: string): Promise<{ success: boolean; forecast: Forecast }> {
    try {
      const response = await api.post(`/forecasts/product/${productId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate forecast');
    }
  },

  async generateAllForecasts(storeId: string): Promise<{ success: boolean; forecasts: Forecast[]; message: string }> {
    try {
      const response = await api.post(`/forecasts/store/${storeId}/all`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate forecasts');
    }
  },

  async getStoreForecasts(storeId: string): Promise<{ success: boolean; forecasts: Forecast[] }> {
    try {
      const response = await api.get(`/forecasts/store/${storeId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch forecasts');
    }
  },

  async getProductLatestForecast(productId: string): Promise<{ success: boolean; forecast: Forecast | null }> {
    try {
      const response = await api.get(`/forecasts/product/${productId}/latest`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch forecast');
    }
  },
};
