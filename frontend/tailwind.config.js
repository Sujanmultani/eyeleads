/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          primary: '#1B3F6E',
          dark: '#0F2744',
        },
        gold: {
          accent: '#B8952A',
        },
        background: '#F5F7FA',
        text: {
          primary: '#1A1A2E',
          muted: '#4A4A6A',
        },
        tint: '#EAF0F8',
        sky: {
          hover: '#2E6DB4',
        },
        sale: '#EC4899',
        rosegold: '#B76E79',
        slate: {
          muted: '#4A5F7F',
        },
      },
      fontSize: {
        'xxs': '11px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideInRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        slideOutRight: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideInRight: 'slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        slideOutRight: 'slideOutRight 0.25s ease-in',
      },
    },
  },
  plugins: [],
}
