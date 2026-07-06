/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#fafaf7',
          1: '#f4f3ef',
          2: '#eeedea',
          3: '#e8e7e3',
          4: '#dddcda',
          5: '#c8c8c5',
        },
        ink: {
          1: '#1a1a1e',
          2: '#3f3f46',
          3: '#71717a',
          4: '#a1a1aa',
        },
        gold: {
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
        },
        neon: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        sage: {
          300: '#b0cdb2',
          400: '#86b089',
          500: '#659368',
          600: '#4f7852',
        },
        warm: {
          50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1',
          400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c',
          800: '#292524', 900: '#1c1917',
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
        'glow-pulse': { '0%, 100%': { opacity: '0.3' }, '50%': { opacity: '0.7' } },
        'float': { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-soft': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        'scan': { '0%, 100%': { transform: 'translateY(-100%)', opacity: '0' }, '50%': { transform: 'translateY(100%)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
