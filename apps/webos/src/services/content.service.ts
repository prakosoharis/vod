import { apiService } from './api';
import type { Content, ContentListResponse } from '../types';

export const contentService = {
  async getFeaturedContent(): Promise<Content[]> {
    return apiService.getFeaturedContent();
  },

  async getTrendingContent(): Promise<Content[]> {
    return apiService.getTrendingContent();
  },

  async getAllContent(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    type?: string;
    search?: string;
  }): Promise<ContentListResponse> {
    return apiService.getAllContent(params);
  },

  async getContentById(id: string): Promise<Content> {
    return apiService.getContentById(id);
  },

  async getContentByGenre(genre: string): Promise<Content[]> {
    return apiService.getContentByGenre(genre);
  },

  async getIndonesianContent(): Promise<Content[]> {
    return apiService.getContentByGenre('Indonesia');
  },

  async getNewReleases(): Promise<Content[]> {
    const response = await apiService.getAllContent({ page: 1, limit: 20 });
    return response.data;
  },

  async getActionContent(): Promise<Content[]> {
    return apiService.getContentByGenre('Action');
  },

  async getDramaContent(): Promise<Content[]> {
    return apiService.getContentByGenre('Drama');
  },

  async searchContent(query: string): Promise<Content[]> {
    const response = await apiService.getAllContent({ search: query });
    return response.data;
  },
};
