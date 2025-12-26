import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';
import type { Content } from '../types';

export interface WatchProgress {
  progress_seconds: number;
  last_watched: string;
}

export interface ContentWithProgress extends Content {
  progress_seconds: number;
  last_watched: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

class UserService {
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
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Watchlist
  async getWatchlist(): Promise<Content[]> {
    const response = await this.client.get('/user/watchlist');
    return response.data;
  }

  async addToWatchlist(contentId: string): Promise<void> {
    await this.client.post('/user/watchlist', { content_id: contentId });
  }

  async removeFromWatchlist(contentId: string): Promise<void> {
    await this.client.delete(`/user/watchlist/${contentId}`);
  }

  // Continue Watching
  async getContinueWatching(): Promise<ContentWithProgress[]> {
    const response = await this.client.get('/user/continue-watching');
    return response.data;
  }

  // Watch Progress
  async getWatchProgress(contentId: string): Promise<WatchProgress> {
    const response = await this.client.get(`/user/watch-progress/${contentId}`);
    return response.data;
  }

  async updateWatchProgress(contentId: string, progressSeconds: number): Promise<WatchProgress> {
    const response = await this.client.put(`/user/watch-progress/${contentId}`, {
      progress_seconds: progressSeconds,
    });
    return response.data;
  }

  // Profile
  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get('/user/profile');
    return response.data;
  }

  async updateProfile(data: {
    full_name?: string | null;
    avatar_url?: string | null;
  }): Promise<UserProfile> {
    const response = await this.client.put('/user/profile', data);
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
