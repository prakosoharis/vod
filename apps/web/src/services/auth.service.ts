import api from './api';
import { useAuthStore } from '../stores/authStore';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '../types';

const TOKEN_KEY = 'token';

export const authService = {
  /**
   * Register a new user
   * @param data - Registration data
   * @returns Auth response with user data and token
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { token, user } = response.data;
      
      // Save token to localStorage
      if (token) {
        this.setToken(token);
      }
      
      return { user, token };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Login user
   * @param data - Login credentials
   * @returns Auth response with user data and token
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      const { token, user } = response.data;
      
      // Save token to localStorage
      if (token) {
        this.setToken(token);
      }
      
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * Removes token from localStorage
   */
  logout(): void {
    try {
      // Remove token from localStorage
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Get current user data
   * @returns Current user information
   */
  async getMe(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Get token from localStorage
   * @returns Token string or null if not found
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  /**
   * Save token to localStorage
   * @param token - Authentication token
   */
  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Set token error:', error);
      throw error;
    }
  },
};

export const userService = authService;

