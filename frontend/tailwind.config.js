/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bedc',
          400: '#609dc9',
          500: '#3b81b3',
          600: '#2b6898',
          700: '#24547c',
          800: '#1e405f',
          900: '#0f2942',
          950: '#091a2c',
        },
        bis: {
          blue: '#0d3b66',
          gold: '#f4d35e',
          amber: '#ee964b',
          crimson: '#f95738',
          teal: '#007f73',
          navy: '#13293d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
