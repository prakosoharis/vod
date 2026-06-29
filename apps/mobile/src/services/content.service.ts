import apiService from './api';
import { API_BASE_URL } from '../constants';
import { Content, ContentListResponse } from '../types';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const resolveMediaUrl = (url: string | null) => {
  if (!url) return url;

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost') {
      parsed.hostname = '127.0.0.1';
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
};

const normalizeContent = (content: Content): Content => ({
  ...content,
  thumbnail_url: resolveMediaUrl(content.thumbnail_url) || content.thumbnail_url,
  backdrop_url: resolveMediaUrl(content.backdrop_url),
  video_url: resolveMediaUrl(content.video_url),
  trailer_url: resolveMediaUrl(content.trailer_url),
  hls_url: resolveMediaUrl(content.hls_url),
  hls_cdn_url: resolveMediaUrl(content.hls_cdn_url),
});

const normalizeContentListResponse = (response: ContentListResponse): ContentListResponse => ({
  ...response,
  data: (response.data || []).map(normalizeContent),
});

export class ContentService {
  async getFeaturedContent(): Promise<Content[]> {
    try {
      const response = await apiService.getFeaturedContent();
      return response.map(normalizeContent);
    } catch (error) {
      throw error;
    }
  }

  async getTrendingContent(): Promise<Content[]> {
    try {
      const response = await apiService.getTrendingContent();
      return response.map(normalizeContent);
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
      return normalizeContentListResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getContentById(id: string): Promise<Content> {
    try {
      const response = await apiService.getContentById(id);
      return normalizeContent(response);
    } catch (error) {
      throw error;
    }
  }

  async getContentByGenre(genre: string, limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getContentByGenre(genre);
      return response.map(normalizeContent).slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  async searchContent(query: string, limit: number = 20): Promise<ContentListResponse> {
    try {
      const response = await apiService.getAllContent({ search: query, limit });
      return normalizeContentListResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getIndonesianContent(limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getAllContent({ genre: 'Indonesian', limit });
      return response.data.map(normalizeContent);
    } catch (error) {
      throw error;
    }
  }

  async getNewReleases(limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getAllContent({ limit });
      return response.data.map(normalizeContent);
    } catch (error) {
      throw error;
    }
  }

  async getActionContent(limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getAllContent({ genre: 'Action', limit });
      return response.data.map(normalizeContent);
    } catch (error) {
      throw error;
    }
  }

  async getDramaContent(limit: number = 20): Promise<Content[]> {
    try {
      const response = await apiService.getAllContent({ genre: 'Drama', limit });
      return response.data.map(normalizeContent);
    } catch (error) {
      throw error;
    }
  }

  async getSimilarContent(genres: string[], excludeId: string, limit: number = 10): Promise<Content[]> {
    try {
      if (!genres || genres.length === 0) return [];
      const response = await apiService.getAllContent({ genre: genres[0], limit });
      return response.data.map(normalizeContent).filter((item: Content) => item.id !== excludeId);
    } catch (error) {
      throw error;
    }
  }
}

export const contentService = new ContentService();
