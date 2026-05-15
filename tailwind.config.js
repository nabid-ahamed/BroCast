/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5b5fc7',
          hover: '#4f52b2',
        },
        dark: {
          bg: '#11100f',
          panel: '#1e1e1e',
          sidebar: '#33344a',
          chatList: '#2b2b2b',
        }
      },
      backgroundImage: {
        'glass-gradient': 'radial-gradient(at 0% 0%, rgba(91, 95, 199, 0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(70, 78, 184, 0.15) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
