import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, '- Status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token
      localStorage.removeItem('token');
      console.warn('🚪 Unauthorized - Token cleared');
    }
    
    return Promise.reject(error);
  }
);

export default api;

