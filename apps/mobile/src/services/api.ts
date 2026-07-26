import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants';
import { clearTokens, getTokens, refreshAccessToken, saveTokens } from './secureAuthStorage';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const tokens = await getTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const requestUrl = String(error.config?.url || '');
        if (error.response?.status === 401 && !error.config?._authRetry &&
            !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh')) {
          const nextToken = await refreshAccessToken();
          if (nextToken) {
            error.config._authRetry = true;
            error.config.headers.Authorization = `Bearer ${nextToken}`;
            return this.client.request(error.config);
          }
        }
        if (error.response?.status === 401 && !requestUrl.includes('/account-deletion')) {
          // Token expired or invalid, clear storage
          await clearTokens();
          await AsyncStorage.removeItem('@user_data');
          // You could navigate to login screen here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email, password, source_platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    if (response.data.token) {
      await saveTokens({
        accessToken: response.data.token,
        refreshToken: response.data.refresh_token,
      });
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async startRegistration(input: {
    method: 'email'; fullName: string;
    destination: string; password: string;
  }) {
    const response = await this.client.post('/auth/register/start', {
      method: input.method,
      email: input.destination,
      password: input.password,
      full_name: input.fullName,
      legal_consent: true,
      terms_version: '2026-07-25',
      privacy_version: '2026-07-25',
      source_platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    return response.data;
  }

  async verifyRegistration(challengeId: string, otp: string) {
    const response = await this.client.post('/auth/register/verify', {
      challenge_id: challengeId, otp,
      source_platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    await saveTokens({
      accessToken: response.data.token,
      refreshToken: response.data.refresh_token,
    });
    await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
    return response.data;
  }

  async resendRegistration() {
    return (await this.client.post('/auth/register/resend', {})).data;
  }

  async forgotPassword(email: string) {
    return (await this.client.post('/auth/forgot-password', { email })).data;
  }

  async verifyRecovery(challengeId: string, otp: string) {
    return (await this.client.post('/auth/recovery/verify', {
      challenge_id: challengeId, otp,
    })).data;
  }

  async resetPassword(recoveryToken: string, password: string) {
    return (await this.client.post('/auth/recovery/reset', {
      recovery_token: recoveryToken, password,
    })).data;
  }

  async social(provider: 'google' | 'facebook') {
    return (await this.client.post(`/auth/oauth/${provider}`, {})).data;
  }

  async getAccountDeletion() {
    const response = await this.client.get('/account-deletion');
    return response.data;
  }

  async requestAccountDeletion(password: string) {
    const response = await this.client.post('/account-deletion', {
      password,
      source_platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    return response.data;
  }

  async cancelAccountDeletion() {
    const response = await this.client.post('/account-deletion/cancel', {});
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      await clearTokens();
      await AsyncStorage.removeItem('@user_data');
    }
  }

  async checkAuth() {
    try {
      const response = await this.client.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Content methods
  async getFeaturedContent() {
    const response = await this.client.get('/content/featured');
    return response.data;
  }

  async getTrendingContent() {
    const response = await this.client.get('/content/trending');
    return response.data;
  }

  async getAllContent(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    type?: string;
    search?: string;
    homepage_section?: 'latest' | 'movie_picks' | 'popular_series';
  }) {
    const response = await this.client.get('/content', { params });
    return response.data;
  }

  async getContentById(id: string) {
    const response = await this.client.get(`/content/${id}`);
    return response.data;
  }

  async getContentByGenre(genre: string) {
    const response = await this.client.get(`/content/genre/${genre}`);
    return response.data;
  }

  // User list methods
  async addToMyList(contentId: string) {
    const response = await this.client.post('/user/my-list', { contentId });
    return response.data;
  }

  async removeFromMyList(contentId: string) {
    const response = await this.client.delete(`/user/my-list/${contentId}`);
    return response.data;
  }

  async getMyList() {
    const response = await this.client.get('/user/my-list');
    return response.data;
  }

  // Live streaming methods
  async getLiveStreams() {
    const response = await this.client.get('/live/streams');
    return response.data;
  }

  async getLiveStreamById(id: string) {
    const response = await this.client.get(`/live/streams/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
