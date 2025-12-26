/**
 * Application Constants
 *
 * Import and re-export design system and configuration
 */

// Import new design system
import { COLORS, NETFLIX_RED } from './colors';
import THEME from './theme';

// API Configuration (Production)
export const API_BASE_URL = 'https://api.mostara.id/api';
export const SOCKET_URL = 'https://api.mostara.id';

// Midtrans Configuration (SANDBOX mode)
export const MIDTRANS_CONFIG = {
  clientKey: 'Mid-client-VMvBYBwPbEvGFUO3',
  merchantId: 'G136369276',
  isProduction: false, // SANDBOX mode for testing
  merchantBaseUrl: 'https://api.mostara.id/api/payment',
};

// Re-export design system
export { COLORS, NETFLIX_RED, THEME };

// Legacy SIZES (for backward compatibility - gradually migrate to THEME)
export const SIZES = {
  base: THEME.spacing.sm,        // 8
  font: THEME.typography.fontSize.sm, // 14
  padding: THEME.spacing.md,     // 16
  radius: THEME.borderRadius.md, // 8
  height: 44,
  width: 375,
};

// FONTS (System fonts)
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

// ASPECT RATIOS
export const ASPECT_RATIO = {
  poster: '2/3',      // Portrait poster (120x180)
  landscape: '16/9',  // Landscape video
  square: '1/1',      // Square
};

// DIMENSIONS (Content card sizes - from THEME)
export const DIMENSIONS = THEME.dimensions;

// UI Configuration
export const LOADING_SKELETON_COUNT = 6;
export const CAROUSEL_AUTO_PLAY_INTERVAL = 5000; // 5 seconds

// Video Player Configuration
export const VIDEO_QUALITY_OPTIONS = ['Auto', '360p', '480p', '720p', '1080p'];
export const VIDEO_PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]; // Extended range

// Export spacing, typography, etc. for convenience
export const { spacing, borderRadius, typography, shadows } = THEME;