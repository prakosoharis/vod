/**
 * Application Constants (TV app - Midtrans removed)
 */
import { COLORS, NETFLIX_RED } from './colors';
import THEME from './theme';

// API Configuration (Production)
export const API_BASE_URL = 'https://api.mostara.id/api';
export const SOCKET_URL = 'https://api.mostara.id';

// Web URL for QR code (user scans to subscribe via web/mobile)
export const WEB_APP_URL = 'https://mostara.id';

// Subscription check polling interval (ms)
export const SUBSCRIPTION_POLL_INTERVAL = 30000; // 30 seconds

// Re-export design system
export { COLORS, NETFLIX_RED, THEME };

export const SIZES = {
  base: THEME.spacing.sm,
  font: THEME.typography.fontSize.sm,
  padding: THEME.spacing.md,
  radius: THEME.borderRadius.md,
  height: 60,
  width: 1920,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const ASPECT_RATIO = {
  poster: '2/3',
  landscape: '16/9',
  square: '1/1',
};

export const DIMENSIONS = THEME.dimensions;

export const LOADING_SKELETON_COUNT = 8;
export const CAROUSEL_AUTO_PLAY_INTERVAL = 8000;

export const VIDEO_QUALITY_OPTIONS = ['Auto', '360p', '480p', '720p', '1080p'];
export const VIDEO_PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Seek amount in seconds (D-pad left/right on video player)
export const SEEK_STEP = 10;
export const SEEK_LONG_STEP = 30;

export const { spacing, borderRadius, typography, shadows } = THEME;
