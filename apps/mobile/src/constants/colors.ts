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
    100: '#E9DBD1',
    200: '#D3B7A3',
    300: '#BD9375',
    400: '#A76F47',
    500: '#914B19',  // Deep espresso - Main brand
    600: '#743C14',
    700: '#572D0F',
    800: '#3A1E0A',
    900: '#1D0F05',
    950: '#0F0803',  // Almost black
  },

  // ACCENT: Burnt Sienna (CTAs, Highlights, Buttons)
  accent: {
    50: '#FBF2ED',   // Lightest burnt sienna
    100: '#F7E5DB',
    200: '#EFCBB7',
    300: '#E7B193',
    400: '#DF976F',
    500: '#C67D4B',  // PRIMARY ACCENT - Use for CTAs
    600: '#9E643C',
    700: '#774B2D',
    800: '#4F321E',
    900: '#28190F',
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
