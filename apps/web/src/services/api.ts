import axios, { type AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Logout user: clear token and redirect to login
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      const errorData = error.response.data as { message?: string } | undefined;
      const errorMessage = errorData?.message || 'Internal server error. Please try again later.';
      console.error('Server Error:', errorMessage);
      alert(errorMessage);
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      const errorMessage = 'Network error. Please check your connection and try again.';
      console.error('Network Error:', errorMessage);
      alert(errorMessage);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;

