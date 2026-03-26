import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export const useAuth = () => {
  const { user, token, logout, setAuth, setError, setLoading } = useAuthStore();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    setIsReady(true);
  }, []);

  const login = React.useCallback(
    async (phone: string, otp: string) => {
      setLoading(true);
      try {
        const response = await authService.verifyOtp(phone, otp);
        setAuth(response.accessToken, response.refreshToken, response.user);
        return response;
      } catch (error: any) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setError, setLoading]
  );

  const sendOtp = React.useCallback(async (phone: string) => {
    setLoading(true);
    try {
      const response = await authService.sendOtp(phone);
      return response;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isReady,
    login,
    logout,
    sendOtp,
  };
};
