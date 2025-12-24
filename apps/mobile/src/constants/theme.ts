/**
 * Warm Coffee House Cinema Theme Configuration
 *
 * Design tokens for spacing, typography, shadows, and other visual properties
 * Matches web app theme for consistent design language
 */

import { COLORS } from './colors';

export const THEME = {
  // Color palette (re-export for convenience)
  colors: COLORS,

  // SPACING (based on 4px grid)
  spacing: {
    xs: 4,    // Extra small - tight spacing
    sm: 8,    // Small - compact spacing
    md: 16,   // Medium - default spacing
    lg: 24,   // Large - generous spacing
    xl: 32,   // Extra large - section spacing
    xxl: 48,  // Extra extra large - major sections
  },

  // BORDER RADIUS
  borderRadius: {
    none: 0,
    sm: 4,    // Small - subtle rounding
    md: 8,    // Medium - default rounding
    lg: 12,   // Large - prominent rounding
    xl: 16,   // Extra large - soft rounding
    xxl: 24,  // Extra extra large
    full: 9999, // Full circle/pill
  },

  // TYPOGRAPHY
  typography: {
    fontSize: {
      xs: 12,   // Extra small - captions, labels
      sm: 14,   // Small - body text
      md: 16,   // Medium - default body
      lg: 18,   // Large - emphasized text
      xl: 20,   // Extra large - sub headings
      xxl: 24,  // Titles
      xxxl: 32, // Large titles
      display: 40, // Display headings
    },
    fontWeight: {
      regular: '400' as '400',
      medium: '500' as '500',
      semibold: '600' as '600',
      bold: '700' as '700',
      extrabold: '800' as '800',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // SHADOWS (React Native style)
  shadows: {
    // Small shadow - subtle depth
    small: {
      shadowColor: COLORS.primary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2, // Android
    },

    // Medium shadow - moderate depth
    medium: {
      shadowColor: COLORS.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4, // Android
    },

    // Large shadow - significant depth
    large: {
      shadowColor: COLORS.accent[500],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8, // Android
    },

    // Extra large shadow - dramatic depth
    xl: {
      shadowColor: COLORS.accent[500],
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12, // Android
    },
  },

  // OPACITY
  opacity: {
    disabled: 0.5,
    hover: 0.8,
    active: 0.9,
    subtle: 0.6,
  },

  // DIMENSIONS (Content card sizes)
  dimensions: {
    poster: {
      width: 120,
      height: 180,
    },
    posterSmall: {
      width: 90,
      height: 135,
    },
    posterLarge: {
      width: 160,
      height: 240,
    },
    landscape: {
      width: 320,
      height: 180, // 16:9 ratio
    },
  },

  // ANIMATION DURATIONS (milliseconds)
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Z-INDEX LEVELS
  zIndex: {
    base: 0,
    dropdown: 1000,
    modal: 2000,
    overlay: 3000,
    toast: 4000,
  },
};

// Export individual theme objects for convenience
export const { spacing, borderRadius, typography, shadows, dimensions } = THEME;

// Default export
export default THEME;
