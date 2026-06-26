import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

export interface BroadcastEvent {
  id: string;
  title: string;
  description?: string;
  scheduled_time: string;
  category: string;
  chat_enabled: boolean;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  viewer_count: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  thumbnail_url?: string;
  stream_key?: string;
  rtmp_url?: string;
  playback_url?: string;
}

class BroadcastService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
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
          await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all broadcasts
  async getBroadcasts(): Promise<BroadcastEvent[]> {
    const response = await this.client.get('/broadcasts');
    // API returns { success: true, data: [...] }
    return response.data?.data || response.data || [];
  }

  // Get broadcast by ID
  async getBroadcastById(id: string): Promise<BroadcastEvent> {
    const response = await this.client.get(`/broadcasts/${id}`);
    // API returns { success: true, data: { ... } }
    return response.data?.data || response.data;
  }

  // Get live broadcasts only
  async getLiveBroadcasts(): Promise<BroadcastEvent[]> {
    const response = await this.client.get('/broadcasts');
    const broadcasts = response.data?.data || response.data || [];
    return broadcasts.filter((b: BroadcastEvent) => b.status === 'LIVE');
  }

  // Get scheduled broadcasts only
  async getScheduledBroadcasts(): Promise<BroadcastEvent[]> {
    const response = await this.client.get('/broadcasts');
    const broadcasts = response.data?.data || response.data || [];
    return broadcasts.filter((b: BroadcastEvent) => b.status === 'SCHEDULED');
  }

  // Get ended broadcasts only
  async getEndedBroadcasts(): Promise<BroadcastEvent[]> {
    const response = await this.client.get('/broadcasts');
    const broadcasts = response.data?.data || response.data || [];
    return broadcasts.filter((b: BroadcastEvent) => b.status === 'ENDED');
  }
}

export const broadcastService = new BroadcastService();
export default broadcastService;
