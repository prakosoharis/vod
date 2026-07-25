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
  hls_url: string | null;
  hls_cdn_url: string | null;
  cast: Array<{ name: string; role: string }>;
  type: 'MOVIE' | 'SERIES';
  featured: boolean;
  show_in_latest?: boolean;
  show_in_movie_picks?: boolean;
  show_in_popular_series?: boolean;
  rental_price?: {
    price: number;
    duration_hours: number;
    is_active: boolean;
  } | null;
  episodes?: Episode[];
  created_at: string;
}

export interface Episode {
  id: string;
  season_number: number;
  episode_number: number;
  title: string;
  description: string | null;
  duration: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  hls_url: string | null;
  is_published: boolean;
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
  refresh_token?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  method: 'email' | 'phone';
  email?: string;
  phone?: string;
  password: string;
  full_name: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  Search: undefined;
  VideoPlayer: {
    contentId: string;
    episodeId?: string;
    previewUrl?: string;
    previewTitle?: string;
  };
  LiveStream: { broadcastId?: string } | undefined;
  ContentDetail: { content: Content };
  /** Legacy route retained for source compatibility; no longer registered in the app navigator. */
  Pricing: undefined;
  PaymentWebView: {
    url: string;
    orderId: string;
    broadcastId?: string;
    contentId?: string;
    type: 'subscription' | 'rental' | 'event';
  };
  PaymentSuccess: { transactionId: string; amount: number; type: 'subscription' | 'rental' | 'event' };
  PaymentError: { errorMessage?: string };
  MyList: undefined;
  WatchHistory: undefined;
  /** Legacy route retained for source compatibility; no longer registered in the app navigator. */
  Subscription: undefined;
  RentalHistory: undefined;
  LiveEvents: undefined;
  LegalWeb: { path: '/privacy' | '/terms' | '/contact' | '/refund-policy' | '/account-deletion'; title: string };
  AccountDeletion: undefined;
  /** Legacy route retained for source compatibility; no longer registered in the app navigator. */
  Upcoming: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Browse: undefined;
  Live: undefined;
  Collection: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Export aliases for compatibility
export type LoginCredentials = LoginRequest;
export type RegisterCredentials = RegisterRequest;
