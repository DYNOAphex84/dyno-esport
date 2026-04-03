/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./source/**/*.{js,ts,jsx,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        dark: '#0a0a0a'
      }
    },
  },
  plugins: [],
}
