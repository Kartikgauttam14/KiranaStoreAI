import api from './api';
import { AuthResponse, SendOtpRequest, VerifyOtpRequest } from '@/types/auth.types';

export const authService = {
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      throw new Error(message);
    }
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to verify OTP';
      throw new Error(message);
    }
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to refresh token';
      throw new Error(message);
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      throw new Error(message);
    }
  },

  async updateProfile(data: any) {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      throw new Error(message);
    }
  },
};
