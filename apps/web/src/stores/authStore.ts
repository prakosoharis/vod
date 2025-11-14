import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

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
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
          set({ isLoading: false, error: errorMessage, isAuthenticated: false });
          throw error;
        }
      },

      register: async (email: string, password: string, full_name?: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.register({ email, password, full_name });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
          set({ isLoading: false, error: errorMessage, isAuthenticated: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
        authService.logout();
      },

      checkAuth: async () => {
        try {
          console.log('🔍 [Auth] Starting auth check...');
          set({ isLoading: true });
          const token = authService.getToken();

          console.log('🔍 [Auth] Token from localStorage:', token ? 'exists' : 'none');

          if (!token) {
            console.log('❌ [Auth] No token found, setting unauthenticated');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            return;
          }

          console.log('🔍 [Auth] Verifying token with /auth/me...');
          // Verify token is still valid by calling getMe
          const user = await authService.getMe();
          console.log('✅ [Auth] Token valid, user:', user?.email);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('❌ [Auth] Token verification failed:', error);
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('💾 [Store] Rehydrating auth store...');
        console.log('💾 [Store] Rehydrated state:', {
          hasUser: !!state?.user,
          hasToken: !!state?.token,
          isAuthenticated: state?.isAuthenticated,
          userEmail: state?.user?.email
        });

        if (state) {
          state.hasHydrated = true;

          // Ensure isAuthenticated is properly set based on token presence
          if (state.token && !state.isAuthenticated) {
            state.isAuthenticated = true;
          }
        }

        // When state is rehydrated from localStorage, set the token in authService
        if (state?.token) {
          console.log('🔑 [Store] Setting rehydrated token to authService');
          authService.setToken(state.token);
        } else {
          console.log('❌ [Store] No token found in rehydrated state');
        }
      },
    }
  )
);

