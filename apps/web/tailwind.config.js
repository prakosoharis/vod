/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', 'class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			// ═══════════════════════════════════════════
  			// MOST DESIGN SYSTEM - WARM COFFEE HOUSE CINEMA
  			// ═══════════════════════════════════════════

  			// PRIMARY: Deep Espresso Brown (MOST's signature color)
  			primary: {
  				'50': '#F4EDE3',
  				'100': '#E8D9C9',
  				'200': '#D4B89A',
  				'300': '#B8956B',
  				'400': '#9C7447',
  				'500': '#2C1810', // ← MAIN BRAND COLOR
  				'600': '#24140D',
  				'700': '#1D100A',
  				'800': '#160C08',
  				'900': '#0F0805',
  				'950': '#080403',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},

  			// ACCENT: Burnt Sienna (Roasted coffee, CTAs, warmth)
  			accent: {
  				'50': '#FBF2ED',
  				'100': '#F7E5DB',
  				'200': '#EFCBB7',
  				'300': '#E7B193',
  				'400': '#DF976F',
  				'500': '#C67D4B', // ← PRIMARY ACCENT (CTAs, hover states)
  				'600': '#A86739',
  				'700': '#7E4D2B',
  				'800': '#54331D',
  				'900': '#2A1A0E',
  				'950': '#150D07',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},

  			// BACKGROUND: Warm Charcoal (cinema darkness)
  			'warm-charcoal': {
  				'50': '#2D2826',
  				'100': '#1A1614',
  				'200': '#141210',
  				'300': '#0F0D0C',
  				'400': '#0A0908',
  				'500': '#050504',
  			},

  			// TEXT: Cream tones
  			'cream': {
  				'50': '#F4EDE3',
  				'100': '#C4B5A3',
  				'200': '#8B7E74',
  				'300': '#5A524B',
  			},

  			// Shadcn UI compatibility
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  			'slide-down': 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  			'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  			'gentle-bounce': 'gentleBounce 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			},
  			slideUp: {
  				'0%': { transform: 'translateY(20px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			slideDown: {
  				'0%': { transform: 'translateY(-20px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			scaleIn: {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' }
  			},
  			gentleBounce: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-10px)' }
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			]
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'warm-gradient': 'linear-gradient(180deg, rgba(26, 22, 20, 0.9) 0%, transparent 100%)',
  			'coffee-glow': 'radial-gradient(circle at center, rgba(198, 125, 75, 0.15) 0%, transparent 70%)',
  			// Legacy compatibility
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'netflix-gradient': 'linear-gradient(180deg, rgba(26, 22, 20, 0.9) 0%, transparent 100%)'
  		},
  		borderRadius: {
  			lg: '0.75rem',
  			md: '0.5rem',
  			sm: '0.375rem',
  			xl: '1rem',
  			'2xl': '1.5rem',
  		},
  		boxShadow: {
  			'warm-sm': '0 1px 2px 0 rgba(44, 24, 16, 0.3)',
  			'warm-md': '0 4px 6px -1px rgba(44, 24, 16, 0.3), 0 2px 4px -1px rgba(44, 24, 16, 0.15)',
  			'warm-lg': '0 10px 15px -3px rgba(44, 24, 16, 0.4), 0 4px 6px -2px rgba(44, 24, 16, 0.2)',
  			'warm-xl': '0 20px 25px -5px rgba(44, 24, 16, 0.5), 0 10px 10px -5px rgba(44, 24, 16, 0.25)',
  			'coffee-glow': '0 0 20px rgba(198, 125, 75, 0.3)',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
