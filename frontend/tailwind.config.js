/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0eeff',
          100: '#e4e0ff',
          200: '#ccc5ff',
          300: '#a99aff',
          400: '#8366ff',
          500: '#6C63FF',
          600: '#5a3ef5',
          700: '#4c2ee0',
          800: '#3f27b8',
          900: '#362494',
          950: '#200f6a',
        },
        secondary: {
          50: '#f0fdf9',
          100: '#ccfbee',
          200: '#99f6de',
          300: '#5eebc9',
          400: '#2dd4af',
          500: '#14b895',
          600: '#0c9479',
          700: '#0d7663',
          800: '#0f5d50',
          900: '#114d43',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c08',
          700: '#c2570a',
          800: '#9a4510',
          900: '#7c3a11',
        },
        dark: {
          50: '#f8f9ff',
          100: '#f0f1f8',
          200: '#dde0f0',
          300: '#b8bedb',
          400: '#8d95bf',
          500: '#6b73a6',
          600: '#545b8a',
          700: '#434971',
          800: '#1a1b2e',
          900: '#12131f',
          950: '#0a0b14',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'typing': 'typing 1.5s steps(3) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(108, 99, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(108, 99, 255, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typing: {
          '0%, 100%': { content: '.' },
          '33%': { content: '..' },
          '66%': { content: '...' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0a0b14 0%, #1a1b2e 50%, #0d0e1a 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'primary-gradient': 'linear-gradient(135deg, #6C63FF 0%, #9C8FFF 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(108, 99, 255, 0.4)',
        'glow-secondary': '0 0 20px rgba(20, 184, 149, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 48px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
