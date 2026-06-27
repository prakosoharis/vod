/**
 * Warm Coffee House Cinema Color Palette
 * Copied from mobile app for consistent branding
 */

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
    500: '#C67D4B', // PRIMARY ACCENT - Use for CTAs
    600: '#9E643C',
    700: '#774B2D',
    800: '#4F321E',
    900: '#28190F',
    950: '#150D07',
  },

  // BACKGROUND: Warm Charcoal (Backgrounds, Surfaces)
  warmCharcoal: {
    50: '#2D2826',
    100: '#1A1614', // MAIN BACKGROUND COLOR
    200: '#141210',
    300: '#0F0D0C',
    400: '#0A0908',
    500: '#050504',
  },

  // TEXT: Cream tones
  cream: {
    50: '#F4EDE3',
    100: '#C4B5A3',
    200: '#8B7E74',
    300: '#5A524B',
  },

  // UTILITY COLORS
  error: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',

  // CATEGORY COLORS
  blue: { 500: '#3B82F6' },
  purple: { 500: '#8B5CF6' },
  green: { 500: '#10B981' },
  yellow: { 400: '#FBBF24', 500: '#F59E0B' },
  orange: { 500: '#F97316' },
  pink: { 500: '#EC4899' },
  teal: { 500: '#14B8A6' },
  gray: { 500: '#6B7280' },
  red: { 400: '#F87171', 500: '#EF4444', 600: '#DC2626' },

  // SPECIAL: Transparent overlays
  overlay: {
    light: 'rgba(26, 22, 20, 0.6)',
    medium: 'rgba(26, 22, 20, 0.8)',
    heavy: 'rgba(26, 22, 20, 0.95)',
  },
};

export const NETFLIX_RED = COLORS.accent[500];
export default COLORS;
