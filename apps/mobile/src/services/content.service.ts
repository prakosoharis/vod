import apiService from './api';
import { Content, ContentListResponse } from '../types';

export class ContentService {
  async getFeaturedContent(): Promise<Content[]> {
    try {
      const response = await apiService.getFeaturedContent();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getTrendingContent(): Promise<Content[]> {
    try {
      const response = await apiService.getTrendingContent();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllContent(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    type?: string;
    search?: string;
  }): Promise<ContentListResponse> {
    try {
      const response = await apiService.getAllContent(params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getContentById(id: string): Promise<Content> {
    try {
      const response = await apiService.getContentById(id);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getContentByGenre(genre: string, limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getContentByGenre(genre);
      return response.slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  async searchContent(query: string, limit: number = 20): Promise<ContentListResponse> {
    try {
      const response = await apiService.getAllContent({ search: query, limit });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getIndonesianContent(limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getAllContent({ genre: 'Indonesian', limit });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getNewReleases(limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getAllContent({ limit });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getActionContent(limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getAllContent({ genre: 'Action', limit });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDramaContent(limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getAllContent({ genre: 'Drama', limit });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSimilarContent(genres: string[], excludeId: string, limit: number = 10): Promise<Content[]> {
    try {
      if (!genres || genres.length === 0) return [];
      const response = await apiService.getAllContent({ genre: genres[0], limit });
      return response.data.filter((item: Content) => item.id !== excludeId);
    } catch (error) {
      throw error;
    }
  }
}

export const contentService = new ContentService();