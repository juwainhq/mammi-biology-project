/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kalpurush: ['Kalpurush', 'Noto Sans Bengali', 'sans-serif'],
        noto: ['Noto Sans Bengali', 'sans-serif'],
        tiro: ['Tiro Bangla', 'Noto Serif Bengali', 'serif'],
      },
    },
  },
  plugins: [],
}
