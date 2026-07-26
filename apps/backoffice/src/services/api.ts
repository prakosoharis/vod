import axios from 'axios'
import { LoginCredentials, AuthResponse, User, Movie, RentalReport, Publisher, BackofficeRole } from '../types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('backoffice_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('backoffice_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/backoffice/auth/login', credentials)
    return response.data
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/backoffice/auth/me')
    return response.data.user
  },
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/api/backoffice/users')
    return response.data
  },
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/api/backoffice/users/${id}`)
    return response.data
  },
  create: async (user: { email: string; full_name: string; password: string }): Promise<User> => {
    const response = await api.post('/api/backoffice/users', user)
    return response.data
  },
  update: async (id: string, user: { full_name?: string; avatar_url?: string }): Promise<User> => {
    const response = await api.put(`/api/backoffice/users/${id}`, user)
    return response.data
  },
  getRentals: async (id: string): Promise<RentalReport> => {
    const response = await api.get(`/api/backoffice/users/${id}/rentals`)
    return response.data
  },
}

export const moviesApi = {
  getAll: async (params?: { type?: string; page?: number; limit?: number }): Promise<{ data: Movie[]; total: number; page: number; totalPages: number }> => {
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await api.get(`/api/backoffice/content?${queryParams.toString()}`)
    return response.data
  },
  getById: async (id: string): Promise<Movie> => {
    const response = await api.get(`/api/backoffice/content/${id}`)
    return response.data
  },
  create: async (movie: Partial<Movie>): Promise<Movie> => {
    const response = await api.post('/api/backoffice/content', movie)
    return response.data
  },
  update: async (id: string, movie: Partial<Movie>): Promise<Movie> => {
    const response = await api.put(`/api/backoffice/content/${id}`, movie)
    return response.data
  },
  getRentals: async (id: string): Promise<RentalReport> => {
    const response = await api.get(`/api/backoffice/content/${id}/rentals`)
    return response.data
  },
}

export const publishersApi = {
  getAll: async (): Promise<Publisher[]> => (await api.get('/api/backoffice/publishers')).data,
  create: async (data: Pick<Publisher, 'name' | 'address' | 'pic_name' | 'pic_phone'>): Promise<Publisher> =>
    (await api.post('/api/backoffice/publishers', data)).data,
  update: async (id: string, data: Partial<Pick<Publisher, 'name' | 'address' | 'pic_name' | 'pic_phone'>>): Promise<Publisher> =>
    (await api.put(`/api/backoffice/publishers/${id}`, data)).data,
}

export const staffApi = {
  getAll: async (): Promise<User[]> => (await api.get('/api/backoffice/staff')).data,
  create: async (data: { email: string; full_name: string; password: string; role: Exclude<BackofficeRole, 'SUPERUSER'>; publisher_id?: string | null }): Promise<User> =>
    (await api.post('/api/backoffice/staff', data)).data,
  update: async (id: string, data: { email?: string; full_name?: string; password?: string; role?: Exclude<BackofficeRole, 'SUPERUSER'>; publisher_id?: string | null; is_active?: boolean }): Promise<User> =>
    (await api.patch(`/api/backoffice/staff/${id}`, data)).data,
}

export default api
