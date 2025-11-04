export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Content {
  id: string;
  title: string;
  description: string | null;
  genre: string[];
  year: number | null;
  rating: number | null;
  duration: string;
  thumbnail_url: string;
  backdrop_url: string | null;
  video_url: string | null;
  trailer_url: string | null;
  cast: CastMember[];
  type: 'MOVIE' | 'SERIES';
  featured: boolean;
  created_at: string;
}

export interface CastMember {
  name: string;
  role: string;
  image?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface ContentListResponse {
  data: Content[];
  total: number;
  page: number;
  totalPages: number;
}

export interface WatchProgress {
  id: string;
  content_id: string;
  progress_seconds: number;
  last_watched: string;
}