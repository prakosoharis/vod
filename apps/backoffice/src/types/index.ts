export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface CastMember {
  name: string
  role: string
}

export interface Movie {
  id: string
  title: string
  description: string
  genre: string[]
  year: number
  rating: string
  duration: string
  thumbnail_url?: string
  backdrop_url?: string
  video_url?: string
  trailer_url?: string
  cast: CastMember[]
  type: 'MOVIE' | 'SERIES'
  featured: boolean
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}