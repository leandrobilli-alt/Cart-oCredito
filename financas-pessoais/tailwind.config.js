/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#059669',
          dark: '#047857',
          light: '#d1fae5',
          soft: '#ecfdf5',
        },
      },
    },
  },
  plugins: [],
}
