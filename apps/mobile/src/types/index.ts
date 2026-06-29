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

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  Search: undefined;
  VideoPlayer: { contentId: string };
  LiveStream: { broadcastId?: string } | undefined;
  ContentDetail: { content: Content };
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
  Subscription: undefined;
  RentalHistory: undefined;
  LiveEvents: undefined;
  Upcoming: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Browse: undefined;
  Live: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Export aliases for compatibility
export type LoginCredentials = LoginRequest;
export type RegisterCredentials = RegisterRequest;
