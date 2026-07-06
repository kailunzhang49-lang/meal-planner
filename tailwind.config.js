/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core dark palette
        surface: {
          0: '#08080c',
          1: '#0e0e14',
          2: '#151520',
          3: '#1c1c2a',
          4: '#252536',
          5: '#2e2e42',
        },
        ink: {
          1: '#ededf0',
          2: '#a1a1aa',
          3: '#71717a',
          4: '#52525b',
        },
        // Accent: warm gold
        gold: {
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#e8a838',
          600: '#d97706',
          700: '#b45309',
        },
        // Tech accent: indigo
        neon: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        // Keep sage for success states
        sage: {
          400: '#86b089',
          500: '#659368',
          600: '#4f7852',
        },
        // Keep warm for backward compat where needed
        warm: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', boxShadow: '0 0 20px rgba(232,168,56,0.15)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(232,168,56,0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'scan': {
          '0%, 100%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { transform: 'translateY(100%)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
