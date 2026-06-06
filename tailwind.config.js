/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nu: {
          purple: '#8A05BE',
          dark: '#3D0066',
          light: '#F0E5F8',
          hover: '#6B01A3',
        },
      },
    },
  },
  plugins: [],
}
