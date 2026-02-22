import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.orange[500],   // #f97316
        secondary: colors.orange[600], // #ea580c
      },
    },
  },
  plugins: [],
}
