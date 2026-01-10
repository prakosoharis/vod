import { apiService } from './api';
import type { LiveStream } from '../types';

export const liveService = {
  async getLiveStreams(): Promise<LiveStream[]> {
    return apiService.getLiveStreams();
  },

  async getLiveStreamById(id: string): Promise<LiveStream> {
    return apiService.getLiveStreamById(id);
  },
};
