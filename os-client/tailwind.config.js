/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#de3636',
          hover: '#cb1c1c',
          light: '#ffefe5',
        },
        app: {
          bg: '#f8fafc',
          surface: '#ffffff',
        },
        neutral: {
          soft: '#f5f5f5',
          dark: '#0f172a',
        },
        action: {
          indigo: '#2563eb',
        },
        status: {
          danger: '#dc2626',
          success: '#059669',
          warning: '#d97706',
          info: '#64748b',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        riseAndGrowBubbles: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(0.25)', opacity: '0' },
          '15%': { opacity: '0.8' },
          '85%': { opacity: '0.8' },
          '100%': { transform: 'translate3d(var(--bubble-dx, 20px), -560px, 0) scale(1.75)', opacity: '0' },
        },
        glassTearDrip: {
          '0%': { transform: 'translate3d(0, 10px, 0) scale(0.2)', opacity: '0' },
          '28%': { transform: 'translate3d(calc(var(--splash-dx, 0px) * 0.35), -26px, 0) scaleY(0.9) scaleX(1.1)', opacity: '0.95' },
          '100%': { transform: 'translate3d(var(--splash-dx, 0px), 24px, 0) scaleY(1.65) scaleX(0.65)', opacity: '0' },
        },
        wallSloshEdges: {
          '0%': { transform: 'rotate3d(0, 0, 1, -1.6deg) translate3d(0, 0, 0)' },
          '50%': { transform: 'rotate3d(0, 0, 1, 0deg) translate3d(0, -4px, 0)' },
          '100%': { transform: 'rotate3d(0, 0, 1, 1.6deg) translate3d(0, 0, 0)' },
        },
        snakeSlither: {
          '0%': { transform: 'translate3d(0, 0, 0) rotate3d(0, 0, 1, 0deg)' },
          '50%': { transform: 'translate3d(0, -2.5px, 0) rotate3d(0, 0, 1, 0.6deg)' },
          '100%': { transform: 'translate3d(0, 1.5px, 0) rotate3d(0, 0, 1, -0.6deg)' },
        },
        pureLinearRight: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        pureLinearLeft: {
          '0%': { transform: 'translate3d(-50%, 0, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        'bubbles': 'riseAndGrowBubbles linear forwards',
        'glass-tear': 'glassTearDrip 3.0s forwards',
        'slosh': 'wallSloshEdges 3.8s ease-in-out infinite alternate',
        'snake': 'snakeSlither 1.66s ease-in-out infinite alternate',
        'wave-right': 'pureLinearRight linear infinite',
        'wave-left': 'pureLinearLeft linear infinite',
      },
    },
  },
  plugins: [],
};
