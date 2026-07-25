import axios from 'axios';
import { getAccessToken, setAccessToken } from './accessToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
let refreshInFlight: Promise<string> | null = null;

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const requestUrl = String(error.config?.url || '');
    if (error.response?.status === 401 && !error.config?._authRetry &&
        !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh')) {
      refreshInFlight ||= axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      ).then((response) => {
        setAccessToken(response.data.token);
        return response.data.token as string;
      }).finally(() => { refreshInFlight = null; });
      try {
        const token = await refreshInFlight;
        error.config._authRetry = true;
        error.config.headers.Authorization = `Bearer ${token}`;
        return api.request(error.config);
      } catch {
        setAccessToken(null);
      }
    }
    if (error.response?.status === 401 && !requestUrl.includes('/account-deletion')) {
      // Unauthorized - clear token
      setAccessToken(null);
    }

    return Promise.reject(error);
  }
);

export default api;
