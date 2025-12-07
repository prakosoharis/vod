import api from './api';
import type { LiveEvent } from '../types';

export const eventService = {
  async getUpcomingEvents(limit = 20): Promise<LiveEvent[]> {
    const response = await api.get('/events', {
      params: { upcoming: 'true', limit }
    });
    return response.data;
  },

  async getCurrentLiveEvent(): Promise<LiveEvent | null> {
    const response = await api.get('/events/live');
    return response.data;
  },

  async getEventById(id: string): Promise<LiveEvent> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
};

export default eventService;
