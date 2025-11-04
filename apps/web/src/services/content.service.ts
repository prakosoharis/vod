import api from './api';
import type { Content, ContentListResponse } from '../types';

export const contentService = {
  /**
   * Get all content with optional filters
   * @param params - Optional query parameters (page, limit, type, genre, featured)
   * @returns Promise with paginated content list
   */
  async getAllContent(params?: {
    page?: number;
    limit?: number;
    type?: 'MOVIE' | 'SERIES';
    genre?: string;
    featured?: boolean;
  }): Promise<ContentListResponse> {
    const response = await api.get<ContentListResponse>('/content', {
      params,
    });
    return response.data;
  },

  /**
   * Get content by ID
   * @param id - Content ID
   * @returns Promise with content details
   */
  async getContentById(id: string): Promise<Content> {
    const response = await api.get<Content>(`/content/${id}`);
    return response.data;
  },

  /**
   * Get featured content
   * @returns Promise with array of featured content
   */
  async getFeaturedContent(): Promise<Content[]> {
    const response = await api.get<Content[]>('/content/featured');
    return response.data;
  },

  /**
   * Get trending content
   * @returns Promise with array of trending content
   */
  async getTrendingContent(): Promise<Content[]> {
    const response = await api.get<Content[]>('/content/trending');
    return response.data;
  },

  /**
   * Search content by query string
   * @param query - Search query string
   * @returns Promise with array of matching content
   */
  async searchContent(query: string): Promise<Content[]> {
    const response = await api.get<Content[]>('/content/search', {
      params: { q: query },
    });
    return response.data;
  },
};
