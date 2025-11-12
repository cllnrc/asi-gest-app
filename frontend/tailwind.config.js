/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '9': '9px',
        '10': '10px',
        '11': '11px',
      }
    },
  },
  plugins: [],
}
