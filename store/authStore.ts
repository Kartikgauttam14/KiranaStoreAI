import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types/auth.types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: any) => ({
      token: null,
      refreshToken: null,
      user: null,
      role: null,
      isLoading: false,
      error: null,
      setAuth: (token: string, refreshToken: string, user: User) =>
        set({
          token,
          refreshToken,
          user,
          role: user.role,
          error: null,
          isLoading: false,
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          role: null,
          error: null,
        }),
      setError: (error: string | null) => set({ error, isLoading: false }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'kirana-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
