import axios from 'axios'
import { LoginCredentials, AuthResponse, User, Movie, CastMember } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials)
    return response.data
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/auth/me')
    return response.data.user
  },
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/api/user/all')
    return response.data
  },
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/api/user/${id}`)
    return response.data
  },
  create: async (user: { email: string; full_name: string; password: string }): Promise<User> => {
    const response = await api.post('/api/user', user)
    return response.data
  },
  update: async (id: string, user: { full_name?: string; avatar_url?: string }): Promise<User> => {
    const response = await api.put(`/api/user/${id}`, user)
    return response.data
  },
}

export const moviesApi = {
  getAll: async (params?: { type?: string; page?: number; limit?: number }): Promise<{ data: Movie[]; total: number; page: number; totalPages: number }> => {
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await api.get(`/api/content?${queryParams.toString()}`)
    return response.data
  },
  getById: async (id: string): Promise<Movie> => {
    const response = await api.get(`/api/content/${id}`)
    return response.data
  },
  create: async (movie: Partial<Movie>): Promise<Movie> => {
    const response = await api.post('/api/content', movie)
    return response.data
  },
  update: async (id: string, movie: Partial<Movie>): Promise<Movie> => {
    const response = await api.put(`/api/content/${id}`, movie)
    return response.data
  },
}

export default api