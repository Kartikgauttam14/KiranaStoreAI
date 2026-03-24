// mobile/__tests__/services/authService.test.ts

import { authService } from '@/services/authService';
import api from '@/services/api';

// Mock axios
jest.mock('@/services/api');

describe('Auth Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'OTP sent successfully'
        }
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.sendOtp('+919876543210');

      expect(result.success).toBe(true);
      expect(api.post).toHaveBeenCalledWith(
        '/auth/send-otp',
        { phone: '+919876543210' }
      );
    });

    it('should handle OTP send failure', async () => {
      (api.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      try {
        await authService.sendOtp('+919876543210');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error instanceof Error).toBe(true);
      }
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return tokens', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 'user_123',
              phone: '+919876543210',
              name: 'John Doe',
              role: 'customer'
            },
            accessToken: 'access_token_xyz',
            refreshToken: 'refresh_token_xyz'
          }
        }
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.verifyOtp(
        '+919876543210',
        '123456'
      );

      expect(result.success).toBe(true);
      expect(api.post).toHaveBeenCalledWith('/auth/verify-otp', {
        phone: '+919876543210',
        otp: '123456'
      });
    });

    it('should handle invalid OTP', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Invalid OTP'
          }
        }
      };

      (api.post as jest.Mock).mockRejectedValueOnce(mockError);

      try {
        await authService.verifyOtp(
          '+919876543210',
          '000000'
        );
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid');
      }
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'user_123',
            phone: '+919876543210',
            name: 'John Doe',
            role: 'customer'
          }
        }
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.getProfile();

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('John Doe');
      expect(api.get).toHaveBeenCalledWith('/auth/profile');
    });
  });
});
