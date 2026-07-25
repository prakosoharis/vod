import api from './api';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '../types';
import { getAccessToken, setAccessToken } from './accessToken';

export const authService = {
  /**
   * Register a new user
   * @param data - Registration data
   * @returns Auth response with user data and token
   */
  async register(data: RegisterRequest) {
    const response = await api.post('/auth/register/start', data);
    return response.data;
  },

  async verifyRegistration(challengeId: string, otp: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/verify', {
      challenge_id: challengeId, otp, source_platform: 'web',
    });
    setAccessToken(response.data.token);
    return response.data;
  },

  async resendRegistration(challengeId: string) {
    const response = await api.post('/auth/register/resend', { challenge_id: challengeId });
    return response.data;
  },

  /**
   * Login user
   * @param data - Login credentials
   * @returns Auth response with user data and token
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    setAccessToken(response.data.token);
    return response.data;
  },

  /**
   * Logout user
   * Removes token from localStorage
   */
  async logout(): Promise<void> {
    try { await api.post('/auth/logout'); } finally { setAccessToken(null); }
  },

  /**
   * Get current user data
   * @returns Current user information
   */
  async getMe(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data.user;
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
    return getAccessToken();
  },

  /**
   * Save token to localStorage
   * @param token - Authentication token
   */
  setToken(token: string): void {
    setAccessToken(token);
  },

  async refresh(): Promise<string> {
    const response = await api.post<{ token: string }>('/auth/refresh', {});
    setAccessToken(response.data.token);
    return response.data.token;
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async verifyRecovery(challengeId: string, otp: string): Promise<{ recovery_token: string }> {
    const response = await api.post('/auth/recovery/verify', { challenge_id: challengeId, otp });
    return response.data;
  },

  async resetPassword(recoveryToken: string, password: string): Promise<{ message: string }> {
    const response = await api.post('/auth/recovery/reset', { recovery_token: recoveryToken, password });
    return response.data;
  },

  async social(provider: 'google' | 'facebook') {
    const response = await api.post(`/auth/oauth/${provider}`, {});
    return response.data;
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
