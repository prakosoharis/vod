import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { User } from '../types';
import { clearTokens, getTokens } from '../services/secureAuthStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  setSession: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,

  login: async (identifier: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await apiService.login(identifier, password);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setSession: (user, token) => set({
    user, token, isAuthenticated: true, isLoading: false, hasHydrated: true,
  }),

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiService.logout();
    } finally {
      await clearTokens();
      await AsyncStorage.removeItem('@user_data');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const tokens = await getTokens();
      if (!tokens?.accessToken) {
        set({ isAuthenticated: false, isLoading: false, hasHydrated: true });
        return;
      }
      const data = await apiService.checkAuth();
      set({
        user: data.user || data,
        token: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
        hasHydrated: true,
      });
    } catch {
      await clearTokens();
      await AsyncStorage.removeItem('@user_data');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        hasHydrated: true,
      });
    }
  },
}));
