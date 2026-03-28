/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: { DEFAULT: '#c8f05a' },
        dark: { DEFAULT: '#0a0a0a', 2: '#111', 3: '#1a1a1a', 4: '#2a2a2a' },
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
