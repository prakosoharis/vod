export const API_BASE_URL = 'https://api.mostara.id/api';
export const SOCKET_URL = 'https://api.mostara.id';

export const MIDTRANS_CONFIG = {
  clientKey: 'Mid-client-VMvBYBwPbEvGFUO3',
  merchantId: 'G136369276',
  isProduction: false,
  merchantBaseUrl: 'https://api.mostara.id/api/payment',
};

// Mostara Logo URL
export const LOGO_URL = 'https://api.mostara.id/api/uploads/logos/logo1.jpg';

// Warm Coffee House Cinema Color Palette
export const COLORS = {
  // PRIMARY: Deep Espresso Brown (Main Brand Color)
  primary: {
    50: '#F4EDE3',
    100: '#E9DBD1',
    200: '#D3B7A3',
    300: '#BD9375',
    400: '#A76F47',
    500: '#914B19',
    600: '#743C14',
    700: '#572D0F',
    800: '#3A1E0A',
    900: '#1D0F05',
    950: '#0F0803',
  },

  // ACCENT: Burnt Sienna (CTAs, Highlights, Buttons)
  accent: {
    50: '#FBF2ED',
    100: '#F7E5DB',
    200: '#EFCBB7',
    300: '#E7B193',
    400: '#DF976F',
    500: '#C67D4B',
    600: '#9E643C',
    700: '#774B2D',
    800: '#4F321E',
    900: '#28190F',
    950: '#150D07',
  },

  // BACKGROUND: Warm Charcoal (Backgrounds, Surfaces)
  warmCharcoal: {
    50: '#2D2826',
    100: '#1A1614',
    200: '#141210',
    300: '#0F0D0C',
    400: '#0A0908',
    500: '#050504',
  },

  // TEXT: Cream tones (Text colors)
  cream: {
    50: '#F4EDE3',
    100: '#C4B5A3',
    200: '#8B7E74',
    300: '#5A524B',
  },
};

export const THEME = {
  colors: {
    background: '#1A1614',
    surface: '#2D2826',
    'surface-hover': '#36302E',
    primary: '#914B19',
    'primary-hover': '#743C14',
    accent: '#C67D4B',
    'accent-hover': '#9E643C',
    'text-primary': '#F4EDE3',
    'text-secondary': '#C4B5A3',
    'text-muted': '#8B7E74',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
};

export const VIDEO_QUALITY_OPTIONS = ['Auto', '360p', '480p', '720p', '1080p'];
export const VIDEO_PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
export const CAROUSEL_AUTO_PLAY_INTERVAL = 5000;
