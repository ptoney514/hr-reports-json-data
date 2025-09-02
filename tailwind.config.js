/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'creighton': {
          'blue': '#0054A6',
          'navy': '#00245D',
          'light-blue': '#1F74DB',
          'sky-blue': '#95D2F3',
          'green': '#71CC98',
          'yellow': '#FFC72C'
        }
      },
      fontFamily: {
        'serif': ['"Nocturne Serif"', '"Gentium Book Basic"', 'Georgia', 'serif'],
        'sans': ['"Proxima Nova"', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}

