import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../utils/constants';

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

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
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
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  async checkAuth() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

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

  async getLiveStreams() {
    const response = await this.client.get('/live/streams');
    return response.data;
  }

  async getLiveStreamById(id: string) {
    const response = await this.client.get(`/live/streams/${id}`);
    return response.data;
  }

  async getSubscriptionPlans() {
    const response = await this.client.get('/payment/plans');
    return response.data;
  }

  async subscribe(planId: string) {
    const response = await this.client.post('/payment/subscribe', { planId });
    return response.data;
  }

  async verifyPaymentStatus(transactionId: string) {
    const response = await this.client.get(`/payment/status/${transactionId}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
