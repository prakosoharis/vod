import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

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
          set({ isLoading: true });
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, full_name?: string) => {
        try {
          set({ isLoading: true });
          const response = await authService.register({ email, password, full_name });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        authService.logout();
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const token = authService.getToken();
          
          if (!token) {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            return;
          }

          // Verify token is still valid by calling getMe
          const user = await authService.getMe();
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid or expired, clear auth state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          // Clear token from localStorage
          localStorage.removeItem('token');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

