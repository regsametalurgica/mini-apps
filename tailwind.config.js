/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        background: {
          main: '#F4F5F7',
          secondary: '#FFFFFF',
          tertiary: '#F8F9FA',
          card: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#00629B',
          hover: '#004F7C',
          active: '#003D60',
        },
        content: {
          main: '#1D2630',
          secondary: '#4A5568',
          tertiary: '#718096',
          disabled: '#A0AEC0',
        },
        border: {
          main: '#E2E8F0',
          subtle: '#EDF2F7',
          input: '#CBD5E0',
        },
        status: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        }
      },
    },
  },
  plugins: [],
}


