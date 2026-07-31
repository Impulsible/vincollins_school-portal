import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#F9F7F4',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#0A2472',
          light: '#1A3A8A',
          dark: '#061852',
          foreground: '#FFFFFF',
          50: '#E8ECF7',
          100: '#D1D9EF',
          200: '#A3B3DF',
          300: '#758DCF',
          400: '#4767BF',
          500: '#0A2472',
          600: '#081D5B',
          700: '#061644',
          800: '#040E2E',
          900: '#020717',
        },
        accent: {
          DEFAULT: '#C9A84C',
          light: '#DBC06A',
          dark: '#A8892E',
          foreground: '#0A2472',
          50: '#F8F3E6',
          100: '#F1E7CD',
          200: '#E3CF9B',
          300: '#D5B769',
          400: '#C7A03E',
          500: '#C9A84C',
          600: '#B8973A',
          700: '#967A2F',
          800: '#745E24',
          900: '#524119',
        },
        secondary: {
          DEFAULT: '#B22234',
          light: '#D43B3D',
          dark: '#8A1A1F',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
        },
        warning: {
          DEFAULT: '#F57F17',
          light: '#FFB300',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        script: ['Dancing Script', 'cursive'],
      },
      borderRadius: {
        lg: '1.5rem',
        md: '1rem',
        sm: '0.75rem',
        xl: '2rem',
        '2xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 8px 32px rgba(10, 36, 114, 0.08)',
        'soft-lg': '0 16px 48px rgba(10, 36, 114, 0.12)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [animate],
}

export default config