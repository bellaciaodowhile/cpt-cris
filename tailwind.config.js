/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3C50E0',
        secondary: '#1C2434',
        dark: '#1C2434',
        light: '#F1F5F9',
      },
    },
  },
  plugins: [],
}
