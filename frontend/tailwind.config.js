/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',
        darkCard: '#1e293b',
        darkBorder: '#334155',
        primary: '#3b82f6',
        accent: '#10b981',
        danger: '#ef4444'
      }
    },
  },
  plugins: [],
}
