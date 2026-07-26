export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  _count?: { rentals: number }
  role?: BackofficeRole
  publisher_id?: string | null
  publisher?: Pick<Publisher, 'id' | 'name'> | null
  is_active?: boolean
}

export type BackofficeRole = 'SUPERUSER' | 'ADMIN' | 'PUBLISHER'

export interface Publisher {
  id: string
  name: string
  address: string
  pic_name: string
  pic_phone: string
  created_at: string
  updated_at: string
  _count?: { contents: number; staff_users: number }
}

export interface CastMember {
  name: string
  role: string
}

export interface Episode {
  id?: string
  season_number: number
  episode_number: number
  title: string
  description?: string
  duration: string
  thumbnail_url?: string
  video_url?: string
  hls_url?: string
  is_published: boolean
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
  hls_url?: string
  trailer_url?: string
  cast: CastMember[]
  type: 'MOVIE' | 'SERIES'
  featured: boolean
  show_in_latest: boolean
  show_in_movie_picks: boolean
  show_in_popular_series: boolean
  created_at: string
  rental_price?: {
    id: string
    price: string
    duration_hours: number
    is_active: boolean
  }
  rental_duration_hours?: number
  rental_active?: boolean
  rental_price_amount?: number
  episodes?: Episode[]
  _count?: { rentals: number }
  publisher_id?: string | null
  publisher?: Publisher | null
}

export interface RentalRecord {
  id: string
  rented_at: string
  expired_at: string
  price_paid: string
  duration_hours: number
  is_active: boolean
  user?: Pick<User, 'id' | 'email' | 'full_name'>
  content?: Pick<Movie, 'id' | 'title' | 'thumbnail_url' | 'year'>
}

export interface RentalReport {
  summary: {
    total_rentals: number
    active_rentals: number
    unique_renters?: number
    gross_revenue?: number
    total_spent?: number
  }
  rentals: RentalRecord[]
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
