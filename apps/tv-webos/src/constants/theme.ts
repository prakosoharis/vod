/**
 * Warm Coffee House Cinema Theme Configuration
 * Adapted for TV - sizes scaled up for 10-foot UI
 */
import { COLORS } from './colors';

// Scale factor for TV (10-foot UI)
// TV is viewed from far, so base sizes need to be larger
const TV_SCALE = 1.4;

export const THEME = {
  colors: COLORS,

  spacing: {
    xs: Math.round(4 * TV_SCALE),       // 6
    sm: Math.round(8 * TV_SCALE),       // 11
    md: Math.round(16 * TV_SCALE),      // 22
    lg: Math.round(24 * TV_SCALE),      // 34
    xl: Math.round(32 * TV_SCALE),      // 45
    xxl: Math.round(48 * TV_SCALE),     // 67
    xxxl: Math.round(64 * TV_SCALE),    // 90
  },

  borderRadius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  typography: {
    fontSize: {
      xs: Math.round(20),       // TV caption
      sm: Math.round(24),       // TV body small
      md: Math.round(28),       // TV body
      lg: Math.round(32),       // TV emphasized
      xl: Math.round(40),       // TV subheading
      xxl: Math.round(48),      // TV title
      xxxl: Math.round(64),     // TV large title
      display: Math.round(80),  // TV display
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // CSS box shadows (TV use)
  shadows: {
    small: '0 2px 8px rgba(145, 75, 25, 0.15)',
    medium: '0 4px 16px rgba(145, 75, 25, 0.2)',
    large: '0 8px 32px rgba(198, 125, 75, 0.3)',
    xl: '0 12px 48px rgba(198, 125, 75, 0.4)',
    // Focus glow for TV spatial navigation
    focusGlow: '0 0 0 4px rgba(198, 125, 75, 0.9), 0 0 32px rgba(198, 125, 75, 0.6)',
  },

  opacity: {
    disabled: 0.4,
    hover: 0.85,
    active: 0.95,
    subtle: 0.6,
    unfocused: 0.7,
  },

  dimensions: {
    poster: { width: 220, height: 330 },
    posterSmall: { width: 180, height: 270 },
    posterLarge: { width: 280, height: 420 },
    landscape: { width: 480, height: 270 }, // 16:9 ratio for TV
    landscapeSmall: { width: 360, height: 200 },
    landscapeLarge: { width: 640, height: 360 },
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  zIndex: {
    base: 0,
    sidebar: 100,
    dropdown: 1000,
    modal: 2000,
    overlay: 3000,
    toast: 4000,
    player: 5000,
  },
};

export const { spacing, borderRadius, typography, shadows, dimensions } = THEME;
export default THEME;
