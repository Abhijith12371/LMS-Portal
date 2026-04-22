/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#f0f0ff',
          100: '#e3e3ff',
          200: '#c7c7ff',
          300: '#a8a8ff',
          400: '#8b8bff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          50:   '#f8fafc',
          100:  '#f1f5f9',
          800:  '#1e293b',
          850:  '#172033',
          900:  '#0f172a',
          950:  '#080c18',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        'glow':     '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-lg':  '0 0 40px rgba(99, 102, 241, 0.3)',
        'card':     '0 4px 24px rgba(0, 0, 0, 0.12)',
        'card-dark':'0 4px 24px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
