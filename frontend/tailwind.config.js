/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system'],
        display: ['"Space Grotesk"', 'Manrope', 'ui-sans-serif', 'system-ui', '-apple-system'],
      },
      colors: {
        skybrand: {
          50: '#f0f9ff',
          100: '#dff4ff',
          500: '#0ea5e9',
          700: '#0369a1',
          900: '#082f49',
        },
        storm: {
          700: '#24324b',
          900: '#101828',
        },
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 23, 42, 0.35)',
        lift: '0 16px 35px -16px rgba(14, 116, 144, 0.4)',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.45s ease-out both',
      },
    },
  },
  plugins: [],
};
