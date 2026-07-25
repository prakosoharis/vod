import { create } from 'zustand';
import { AsyncStorage } from '@/lib/storage';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await apiService.login(email, password);
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

  register: async (email: string, password: string, fullName?: string) => {
    set({ isLoading: true });
    try {
      const data = await apiService.register(email, password, fullName);
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

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiService.logout();
    } finally {
      await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
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
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        set({ isAuthenticated: false, isLoading: false, hasHydrated: true });
        return;
      }
      const data = await apiService.checkAuth();
      set({
        user: data.user || data,
        token,
        isAuthenticated: true,
        isLoading: false,
        hasHydrated: true,
      });
    } catch {
      await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
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
