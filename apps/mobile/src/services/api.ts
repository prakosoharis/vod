import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

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
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
          // You could navigate to login screen here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(email: string, password: string, fullName?: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    if (response.data.token) {
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
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