/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#f8f4ec',
          200: '#f0e8d7',
          300: '#e5d7bd',
          400: '#d7c09e',
          500: '#c5a77f',
          800: '#4a3b2c',
          900: '#2b2219',
        },
        biblical: {
          primary: '#1e293b',
          gold: '#c29b38',
          red: '#881337',
          blue: '#0369a1',
        },
        highlight: {
          yellow: '#fef08a',
          green: '#bbf7d0',
          blue: '#bae6fd',
          pink: '#fbcfe8',
          purple: '#e9d5ff',
          orange: '#fed7aa',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Courier Prime"', '"Courier New"', 'Courier', 'monospace'],
        handwriting: ['Caveat', '"Patrick Hand"', 'cursive'],
        hebrew: ['"SBL Hebrew"', '"Ezra SIL"', '"Frank Ruehl CLM"', 'David', 'serif'],
        greek: ['"SBL Greek"', '"Gentium Plus"', '"Cardo"', 'serif'],
      }
    },
  },
  plugins: [],
}
