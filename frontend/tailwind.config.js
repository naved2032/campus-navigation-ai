/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          dark: '#0b0f19',
          card: '#131b2e',
          accent: '#6366f1'
        }
      }
    },
  },
  plugins: [],
}
