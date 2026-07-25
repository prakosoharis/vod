import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';
import { AxiosError } from 'axios';

type ApiError = {
  error?: string;
  message?: string;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as AxiosError<ApiError>;
  return apiError.response?.data?.error || apiError.response?.data?.message || fallback;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  setSession: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token) => {
        set({ token });
        if (token) {
          authService.setToken(token);
        } else {
          localStorage.removeItem('token');
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login({
            email, password, source_platform: 'web',
          });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage = getApiErrorMessage(error, 'Login failed. Please try again.');
          set({ isLoading: false, error: errorMessage, isAuthenticated: false });
          throw error;
        }
      },

      setSession: (user, token) => {
        authService.setToken(token);
        set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      },

      logout: async () => {
        await authService.logout();
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          let token = authService.getToken();
          if (!token) token = await authService.refresh();

          // Verify token is still valid by calling getMe
          const user = await authService.getMe();
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token is invalid or expired, clear auth state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          authService.setToken('');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
          state.token = null;
          state.isAuthenticated = false;
        }
      },
    }
  )
);
