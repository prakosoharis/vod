import api from './api';
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
      const token = localStorage.getItem(TOKEN_KEY);
      console.log('🔍 [AuthService] getToken:', token ? 'found' : 'not found');
      return token;
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
      console.log('💾 [AuthService] setToken: saving token');
      localStorage.setItem(TOKEN_KEY, token);
      console.log('✅ [AuthService] setToken: token saved successfully');
    } catch (error) {
      console.error('Set token error:', error);
      throw error;
    }
  },

  /**
   * Add content to user's watchlist
   * @param contentId - Content ID to add
   * @returns API response
   */
  async addToWatchlist(contentId: string) {
    try {
      const response = await api.post('/user/watchlist', { content_id: contentId });
      return response.data;
    } catch (error) {
      console.error('Add to watchlist error:', error);
      throw error;
    }
  },

  /**
   * Remove content from user's watchlist
   * @param contentId - Content ID to remove
   * @returns API response
   */
  async removeFromWatchlist(contentId: string) {
    try {
      const response = await api.delete(`/user/watchlist/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      throw error;
    }
  },

  /**
   * Get user's watchlist
   * @returns Array of watchlisted content
   */
  async getWatchlist() {
    try {
      const response = await api.get('/user/watchlist');
      return response.data;
    } catch (error) {
      console.error('Get watchlist error:', error);
      throw error;
    }
  },

  /**
   * Get continue watching list
   * @returns Array of content for continue watching
   */
  async getContinueWatching() {
    try {
      const response = await api.get('/user/continue-watching');
      return response.data;
    } catch (error) {
      console.error('Get continue watching error:', error);
      throw error;
    }
  },
};

export const userService = authService;

