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
          main: '#111111',
          secondary: '#161616',
          tertiary: '#1B1B1B',
          card: '#181818',
        },
        primary: {
          DEFAULT: '#2D8C63',
          hover: '#36A875',
          active: '#22684A',
        },
        content: {
          main: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.72)',
          tertiary: 'rgba(255, 255, 255, 0.45)',
          disabled: 'rgba(255, 255, 255, 0.25)',
        },
        border: {
          main: 'rgba(255, 255, 255, 0.06)',
          subtle: 'rgba(255, 255, 255, 0.04)',
          input: 'rgba(255, 255, 255, 0.05)',
        },
        status: {
          success: '#2D8C63',
          error: '#C84D4D',
          warning: '#D8A24C',
        }
      },
    },
  },
  plugins: [],
}


