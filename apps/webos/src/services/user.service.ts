import { apiService } from './api';
import type { Content } from '../types';

export const userService = {
  async getMyList(): Promise<Content[]> {
    return apiService.getMyList();
  },

  async addToMyList(contentId: string): Promise<void> {
    await apiService.addToMyList(contentId);
  },

  async removeFromMyList(contentId: string): Promise<void> {
    await apiService.removeFromMyList(contentId);
  },

  async getContinueWatching(): Promise<Content[]> {
    const response = await apiService.getAllContent({ limit: 10 });
    return response.data;
  },
};
