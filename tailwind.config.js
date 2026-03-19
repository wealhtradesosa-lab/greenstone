/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          deep: '#064E3B',
          mid: '#047857',
          light: '#10B981',
          glow: '#34D399',
        },
        gold: {
          DEFAULT: '#C8A951',
          light: '#E2CB7D',
        },
        ivory: '#FEFCF3',
        pearl: '#FAF8F0',
        charcoal: '#1A1A1A',
        'warm-gray': '#6B6B6B',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        elegant: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
