import api from './api';
import type { Content, ContentListResponse } from '../types';

export const contentService = {
  async getFeaturedContent(): Promise<Content[]> {
    console.log('🎬 Fetching featured content...');
    const response = await api.get('/content/featured');
    return response.data;
  },

  async getTrendingContent(): Promise<Content[]> {
    console.log('📈 Fetching trending content...');
    const response = await api.get('/content/trending');
    return response.data;
  },

  async getAllContent(params?: {
    page?: number;
    limit?: number;
    type?: string;
    genre?: string;
    featured?: boolean;
  }): Promise<ContentListResponse> {
    console.log('📋 Fetching all content with params:', params);
    const response = await api.get('/content', { params });
    return response.data;
  },

  async getContentById(id: string): Promise<Content> {
    console.log('🎥 Fetching content by ID:', id);
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  async searchContent(query: string): Promise<Content[]> {
    console.log('🔍 Searching content:', query);
    const response = await api.get('/content/search', { params: { q: query } });
    return response.data;
  },
};

export default contentService;
