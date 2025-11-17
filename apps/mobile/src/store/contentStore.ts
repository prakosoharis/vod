import { create } from 'zustand';
import type { Content, LiveStream, ContentListResponse } from '../types';
import { contentService } from '../services/contentService';

interface ContentState {
  // Movies/Series
  featuredContent: Content[];
  movies: Content[];
  series: Content[];
  liveStreams: LiveStream[];

  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;

  // Error handling
  error: string | null;

  // Actions
  fetchFeaturedContent: () => Promise<void>;
  fetchMovies: (page?: number) => Promise<void>;
  fetchSeries: (page?: number) => Promise<void>;
  fetchLiveStreams: () => Promise<void>;
  loadMoreMovies: () => Promise<void>;
  loadMoreSeries: () => Promise<void>;
  refreshContent: () => Promise<void>;
  clearError: () => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  featuredContent: [],
  movies: [],
  series: [],
  liveStreams: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  error: null,

  fetchFeaturedContent: async () => {
    try {
      set({ isLoading: true, error: null });
      const content = await contentService.getFeaturedContent();
      set({ featuredContent: content, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch featured content';
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchMovies: async (page = 1) => {
    try {
      const isFirstPage = page === 1;
      if (isFirstPage) {
        set({ isLoading: true, error: null });
      } else {
        set({ isLoadingMore: true });
      }

      const response = await contentService.getMovies(page);

      if (isFirstPage) {
        set({
          movies: response.data,
          currentPage: response.page,
          totalPages: response.totalPages,
          totalItems: response.total,
          isLoading: false,
        });
      } else {
        set({
          movies: [...get().movies, ...response.data],
          currentPage: response.page,
          totalPages: response.totalPages,
          totalItems: response.total,
          isLoadingMore: false,
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch movies';
      set({
        isLoading: false,
        isLoadingMore: false,
        error: errorMessage,
      });
    }
  },

  fetchSeries: async (page = 1) => {
    try {
      const isFirstPage = page === 1;
      if (isFirstPage) {
        set({ isLoading: true, error: null });
      } else {
        set({ isLoadingMore: true });
      }

      const response = await contentService.getSeries(page);

      if (isFirstPage) {
        set({
          series: response.data,
          currentPage: response.page,
          totalPages: response.totalPages,
          totalItems: response.total,
          isLoading: false,
        });
      } else {
        set({
          series: [...get().series, ...response.data],
          currentPage: response.page,
          totalPages: response.totalPages,
          totalItems: response.total,
          isLoadingMore: false,
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch series';
      set({
        isLoading: false,
        isLoadingMore: false,
        error: errorMessage,
      });
    }
  },

  fetchLiveStreams: async () => {
    try {
      set({ isLoading: true, error: null });
      const streams = await contentService.getLiveStreams();
      set({ liveStreams: streams, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch live streams';
      set({ isLoading: false, error: errorMessage });
    }
  },

  loadMoreMovies: async () => {
    const { currentPage, totalPages, isLoadingMore } = get();
    if (currentPage < totalPages && !isLoadingMore) {
      get().fetchMovies(currentPage + 1);
    }
  },

  loadMoreSeries: async () => {
    const { currentPage, totalPages, isLoadingMore } = get();
    if (currentPage < totalPages && !isLoadingMore) {
      get().fetchSeries(currentPage + 1);
    }
  },

  refreshContent: async () => {
    set({ isRefreshing: true });
    try {
      await Promise.all([
        get().fetchFeaturedContent(),
        get().fetchMovies(1),
        get().fetchSeries(1),
        get().fetchLiveStreams(),
      ]);
      set({ isRefreshing: false });
    } catch (error) {
      set({ isRefreshing: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));