/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        background: '#1A1614',
        surface: '#2D2826',
        'surface-hover': '#36302E',

        // Primary colors (Deep Espresso Brown)
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

        // Accent colors (Burnt Sienna)
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

        // Text colors (Cream tones)
        text: {
          primary: '#F4EDE3',
          secondary: '#C4B5A3',
          muted: '#8B7E74',
        },

        // Utility colors
        error: '#DC2626',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
