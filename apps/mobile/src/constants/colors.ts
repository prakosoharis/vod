/**
 * Warm Coffee House Cinema Color Palette
 *
 * This color system matches the web app theme for consistent branding
 * across all platforms.
 */

export const COLORS = {
  // PRIMARY: warm cinematic Nusantara surfaces
  primary: {
    50: '#F4ECD9',
    100: '#E7DAC0',
    200: '#D2C3A5',
    300: '#B7A683',
    400: '#9E9175',
    500: '#332C1F',
    600: '#282319',
    700: '#1E1B13',
    800: '#17150F',
    900: '#100F0B',
    950: '#090806',
  },

  // ACCENT: Burnt Sienna (CTAs, Highlights, Buttons)
  accent: {
    50: '#FBF2ED',   // Lightest burnt sienna
    100: '#F7E5DB',
    200: '#EFCBB7',
    300: '#E7B193',
    400: '#DF976F',
    500: '#C98431',
    600: '#A86729',
    700: '#7E4D2B',
    800: '#54331D',
    900: '#2A1A0E',
    950: '#150D07',
  },

  // BACKGROUND: Warm Charcoal (Backgrounds, Surfaces)
  warmCharcoal: {
    50: '#282319',
    100: '#17150F',
    200: '#1E1B13',
    300: '#332C1F',
    400: '#100F0B',
    500: '#090806',
  },

  // TEXT: Cream tones (Text colors)
  cream: {
    50: '#F4ECD9',
    100: '#D2C3A5',
    200: '#9E9175',
    300: '#6F664F',
  },

  // UTILITY COLORS (Semantic)
  error: '#DC2626',    // Red for errors
  success: '#10B981',  // Green for success
  warning: '#F59E0B',  // Amber for warnings
  info: '#3B82F6',     // Blue for info

  // CATEGORY COLORS (For live streaming categories, etc.)
  blue: {
    400: '#60A5FA',
    500: '#3B82F6',
  },
  purple: {
    500: '#8B5CF6',
  },
  green: {
    400: '#34D399',
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
    light: 'rgba(23, 21, 15, 0.58)',
    medium: 'rgba(23, 21, 15, 0.80)',
    heavy: 'rgba(23, 21, 15, 0.96)',
  },
  clay: '#A65335',
  indigoGreen: '#596B68',
};

// Alias for backward compatibility and easy migration
export const NETFLIX_RED = COLORS.accent[500]; // Replace all NETFLIX_RED usage with this

// Default export
export default COLORS;
