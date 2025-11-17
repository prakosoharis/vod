import api from './api';
import type { Content, LiveStream, ContentListResponse } from '../types';

export const contentService = {
  /**
   * Get featured content
   * @returns Array of featured content
   */
  async getFeaturedContent(): Promise<Content[]> {
    try {
      const response = await api.get('/content/featured');
      return response.data;
    } catch (error) {
      console.error('Get featured content error:', error);
      throw error;
    }
  },

  /**
   * Get trending content
   * @returns Array of trending content
   */
  async getTrendingContent(): Promise<Content[]> {
    try {
      const response = await api.get('/content/trending');
      return response.data;
    } catch (error) {
      console.error('Get trending content error:', error);
      throw error;
    }
  },

  /**
   * Get all content with pagination and filters
   * @param params - Query parameters
   * @returns Paginated content response
   */
  async getAllContent(params?: {
    page?: number;
    limit?: number;
    type?: string;
    genre?: string;
    featured?: boolean;
  }): Promise<ContentListResponse> {
    try {
      const response = await api.get('/content', { params });
      return response.data;
    } catch (error) {
      console.error('Get all content error:', error);
      throw error;
    }
  },

  /**
   * Get movies only
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated movies response
   */
  async getMovies(page = 1, limit = 20): Promise<ContentListResponse> {
    try {
      const response = await api.get('/content', {
        params: { page, limit, type: 'MOVIE' }
      });
      return response.data;
    } catch (error) {
      console.error('Get movies error:', error);
      throw error;
    }
  },

  /**
   * Get series only
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated series response
   */
  async getSeries(page = 1, limit = 20): Promise<ContentListResponse> {
    try {
      const response = await api.get('/content', {
        params: { page, limit, type: 'SERIES' }
      });
      return response.data;
    } catch (error) {
      console.error('Get series error:', error);
      throw error;
    }
  },

  /**
   * Get content by ID
   * @param id - Content ID
   * @returns Content details
   */
  async getContentById(id: string): Promise<Content> {
    try {
      const response = await api.get(`/content/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get content by ID error:', error);
      throw error;
    }
  },

  /**
   * Search content
   * @param query - Search query
   * @returns Array of matching content
   */
  async searchContent(query: string): Promise<Content[]> {
    try {
      const response = await api.get('/content/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Search content error:', error);
      throw error;
    }
  },

  /**
   * Get live streams
   * @returns Array of live streams
   */
  async getLiveStreams(): Promise<LiveStream[]> {
    try {
      const response = await api.get('/streams/live');
      return response.data;
    } catch (error) {
      console.error('Get live streams error:', error);
      throw error;
    }
  },

  /**
   * Get live stream by ID
   * @param id - Stream ID
   * @returns Live stream details
   */
  async getLiveStreamById(id: string): Promise<LiveStream> {
    try {
      const response = await api.get(`/streams/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get live stream by ID error:', error);
      throw error;
    }
  },

  /**
   * Get content by genre
   * @param genre - Genre name
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated content response
   */
  async getContentByGenre(genre: string, page = 1, limit = 20): Promise<ContentListResponse> {
    try {
      const response = await api.get('/content', {
        params: { page, limit, genre }
      });
      return response.data;
    } catch (error) {
      console.error('Get content by genre error:', error);
      throw error;
    }
  },

  /**
   * Get content recommendations
   * @param contentId - Content ID for recommendations
   * @returns Array of recommended content
   */
  async getRecommendations(contentId: string): Promise<Content[]> {
    try {
      const response = await api.get(`/content/${contentId}/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  },

  /**
   * Rate content
   * @param contentId - Content ID
   * @param rating - Rating value (1-5)
   * @returns API response
   */
  async rateContent(contentId: string, rating: number) {
    try {
      const response = await api.post(`/content/${contentId}/rate`, { rating });
      return response.data;
    } catch (error) {
      console.error('Rate content error:', error);
      throw error;
    }
  },

  /**
   * Track watch progress
   * @param contentId - Content ID
   * @param progress - Progress percentage (0-100)
   * @returns API response
   */
  async updateWatchProgress(contentId: string, progress: number) {
    try {
      const response = await api.post(`/user/watch-progress`, {
        content_id: contentId,
        progress
      });
      return response.data;
    } catch (error) {
      console.error('Update watch progress error:', error);
      throw error;
    }
  },
};

export default contentService;