/**
 * Warm Coffee House Cinema Color Palette
 *
 * This color system matches the web app theme for consistent branding
 * across all platforms.
 */

export const COLORS = {
  // PRIMARY: Deep Espresso Brown (Main Brand Color)
  primary: {
    50: '#F4EDE3',   // Lightest latte
    100: '#E8D9C9',
    200: '#D4B89A',
    300: '#B8956B',
    400: '#9C7447',
    500: '#2C1810',
    600: '#24140D',
    700: '#1D100A',
    800: '#160C08',
    900: '#0F0805',
    950: '#080403',
  },

  // ACCENT: Burnt Sienna (CTAs, Highlights, Buttons)
  accent: {
    50: '#FBF2ED',   // Lightest burnt sienna
    100: '#F7E5DB',
    200: '#EFCBB7',
    300: '#E7B193',
    400: '#DF976F',
    500: '#C67D4B',  // PRIMARY ACCENT - Use for CTAs
    600: '#A86739',
    700: '#7E4D2B',
    800: '#54331D',
    900: '#2A1A0E',
    950: '#150D07',
  },

  // BACKGROUND: Warm Charcoal (Backgrounds, Surfaces)
  warmCharcoal: {
    50: '#2D2826',   // Lighter charcoal
    100: '#1A1614',  // MAIN BACKGROUND COLOR
    200: '#141210',
    300: '#0F0D0C',
    400: '#0A0908',
    500: '#050504',  // Darkest
  },

  // TEXT: Cream tones (Text colors)
  cream: {
    50: '#F4EDE3',   // PRIMARY TEXT - High emphasis
    100: '#C4B5A3',  // SECONDARY TEXT - Medium emphasis
    200: '#8B7E74',  // MUTED TEXT - Low emphasis
    300: '#5A524B',  // DISABLED TEXT
  },

  // UTILITY COLORS (Semantic)
  error: '#DC2626',    // Red for errors
  success: '#10B981',  // Green for success
  warning: '#F59E0B',  // Amber for warnings
  info: '#3B82F6',     // Blue for info

  // CATEGORY COLORS (For live streaming categories, etc.)
  blue: {
    500: '#3B82F6',
  },
  purple: {
    500: '#8B5CF6',
  },
  green: {
    500: '#10B981',
  },
  yellow: {
    400: '#FBBF24',
    500: '#F59E0B',
  },
  orange: {
    500: '#F97316',
  },
  pink: {
    500: '#EC4899',
  },
  teal: {
    500: '#14B8A6',
  },
  gray: {
    500: '#6B7280',
  },
  red: {
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
  },

  // SPECIAL: Transparent overlays
  overlay: {
    light: 'rgba(26, 22, 20, 0.6)',   // Light overlay
    medium: 'rgba(26, 22, 20, 0.8)',  // Medium overlay
    heavy: 'rgba(26, 22, 20, 0.95)',  // Heavy overlay
  },
};

// Alias for backward compatibility and easy migration
export const NETFLIX_RED = COLORS.accent[500]; // Replace all NETFLIX_RED usage with this

// Default export
export default COLORS;
