/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B1220',
          800: '#121B2E',
          700: '#1A2740',
        },
        mountain: {
          600: '#2F6690',
          500: '#3E7FAF',
          400: '#6AA3C9',
        },
        sunrise: {
          500: '#F2994A',
          400: '#F4B265',
        },
        status: {
          upcoming: '#64748B',
          progress: '#3E7FAF',
          completed: '#2FA86A',
          skipped: '#9AA3B2',
          cancelled: '#E1544C',
          pending: '#F2994A',
          paid: '#2FA86A',
          disputed: '#E1544C',
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 8px 24px -8px rgba(7, 11, 20, 0.25)',
      },
    },
  },
  plugins: [],
}
