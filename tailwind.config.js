/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        roseTheme: {
          light: "#ffe4f1",   // rosa pastel clar
          DEFAULT: "#ff9acb", // rosa principal
          dark: "#e75480",    // rosa fúcsia / fort
          accent: "#ffb7d5",  // rosa accent
          soft: "#ffd6e9",    // fons suau
        },
      },
    },
  },
  plugins: [],
}