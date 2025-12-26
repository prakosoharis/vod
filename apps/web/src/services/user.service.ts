import api from './api';
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

export const userService = {
  // Watchlist
  async getWatchlist(): Promise<Content[]> {
    const response = await api.get('/user/watchlist');
    return response.data;
  },

  async addToWatchlist(contentId: string): Promise<void> {
    await api.post('/user/watchlist', { content_id: contentId });
  },

  async removeFromWatchlist(contentId: string): Promise<void> {
    await api.delete(`/user/watchlist/${contentId}`);
  },

  // Continue Watching
  async getContinueWatching(): Promise<ContentWithProgress[]> {
    const response = await api.get('/user/continue-watching');
    return response.data;
  },

  // Watch Progress
  async getWatchProgress(contentId: string): Promise<WatchProgress> {
    const response = await api.get(`/user/watch-progress/${contentId}`);
    return response.data;
  },

  async updateWatchProgress(contentId: string, progressSeconds: number): Promise<WatchProgress> {
    const response = await api.put(`/user/watch-progress/${contentId}`, {
      progress_seconds: progressSeconds,
    });
    return response.data;
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(data: {
    full_name?: string | null;
    avatar_url?: string | null;
  }): Promise<UserProfile> {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
};

export default userService;
