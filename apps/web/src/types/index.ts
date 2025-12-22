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
  cast: Array<{ name: string; role: string }>;
  type: 'MOVIE' | 'SERIES';
  featured: boolean;
  created_at: string;

  // HLS Transcoding Fields
  hls_video_id?: string | null;
  hls_url?: string | null;
  hls_cdn_url?: string | null;
  transcoding_status?: string | null;
  transcoded_at?: string | null;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: 'GALA_PREMIERE' | 'STANDUP_COMEDY' | 'CONCERT' | 'SPECIAL_EVENT';
  scheduled_at: string;
  duration_minutes: number | null;
  thumbnail_url: string;
  backdrop_url: string | null;
  stream_key: string;
  host_name: string | null;
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentListResponse {
  data: Content[];
  total: number;
  page: number;
  totalPages: number;
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

// Export aliases for useAuth hook compatibility
export type LoginCredentials = LoginRequest;
export type RegisterCredentials = RegisterRequest;
