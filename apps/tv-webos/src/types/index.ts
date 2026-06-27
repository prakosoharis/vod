/**
 * Type definitions - copied from mobile app
 * Midtrans/Payment types removed (not used in TV)
 */

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
  year: number | string | null;
  // Rating may come as number or string from API
  rating: number | string | null;
  duration: string | number;
  thumbnail_url: string;
  backdrop_url: string | null;
  video_url: string | null;
  trailer_url: string | null;
  hls_url: string | null;
  hls_cdn_url: string | null;
  cast: Array<{ name: string; role: string }>;
  type: 'MOVIE' | 'SERIES';
  featured: boolean;
  created_at: string;
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

// Subscription status (for paygate, replaces payment)
export type SubscriptionStatus = 'active' | 'expired' | 'none' | 'trial' | 'loading';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  plan?: string;
  expires_at?: string | null;
  has_payment_method?: boolean;
}

export type LoginCredentials = LoginRequest;
export type RegisterCredentials = RegisterRequest;
