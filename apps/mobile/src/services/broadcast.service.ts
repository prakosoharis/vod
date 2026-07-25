import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearTokens, getTokens } from './secureAuthStorage';
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
  ticket_price?: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  thumbnail_url?: string;
  backdrop_url?: string;
  stream_key?: string;
  rtmp_url?: string;
  playback_url?: string;
}

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const resolveMediaUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

const normalizeBroadcast = (broadcast: BroadcastEvent): BroadcastEvent => ({
  ...broadcast,
  thumbnail_url: resolveMediaUrl(broadcast.thumbnail_url),
  backdrop_url: resolveMediaUrl(broadcast.backdrop_url),
});

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
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await clearTokens();
          await AsyncStorage.removeItem('@user_data');
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all broadcasts
  async getBroadcasts(): Promise<BroadcastEvent[]> {
    const response = await this.client.get('/broadcasts');
    // API returns { success: true, data: [...] }
    const broadcasts = response.data?.data || response.data || [];
    return broadcasts.map(normalizeBroadcast);
  }

  // Get broadcast by ID
  async getBroadcastById(id: string): Promise<BroadcastEvent> {
    const response = await this.client.get(`/broadcasts/${id}`);
    // API returns { success: true, data: { ... } }
    return normalizeBroadcast(response.data?.data || response.data);
  }

  // Get playable broadcast details after ticket access is verified
  async getBroadcastPlayerById(id: string): Promise<BroadcastEvent> {
    const response = await this.client.get(`/broadcasts/${id}/player`);
    return normalizeBroadcast(response.data?.data || response.data);
  }

  // Get live broadcasts only
  async getLiveBroadcasts(): Promise<BroadcastEvent[]> {
    const response = await this.client.get('/broadcasts');
    const broadcasts = response.data?.data || response.data || [];
    return broadcasts.map(normalizeBroadcast).filter((b: BroadcastEvent) => b.status === 'LIVE');
  }

  // Get scheduled broadcasts only
  async getScheduledBroadcasts(): Promise<BroadcastEvent[]> {
    const response = await this.client.get('/broadcasts');
    const broadcasts = response.data?.data || response.data || [];
    return broadcasts.map(normalizeBroadcast).filter((b: BroadcastEvent) => b.status === 'SCHEDULED');
  }

  // Get ended broadcasts only
  async getEndedBroadcasts(): Promise<BroadcastEvent[]> {
    const response = await this.client.get('/broadcasts');
    const broadcasts = response.data?.data || response.data || [];
    return broadcasts.map(normalizeBroadcast).filter((b: BroadcastEvent) => b.status === 'ENDED');
  }
}

export const broadcastService = new BroadcastService();
export default broadcastService;
