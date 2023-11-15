module.exports = {
  content: [
    "./src/**/*.{.ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': '#fffbee',
        'primary': '#FFC248',
        'success': '#22b124',
        'error': '#ff0000',
        'type-tag': '#7731d9',
        'keywords-tag': '#d60d51',
        'agerange-tag': '#ff9b15',
        'pbeejonly-tag': '#623d1c',
        'collaborators-tag': '#1a75ff',
        'title-description-tag': '#22b124'
      },
    },
    screens: {
      'xsm': '120px',
      // => @media (min-width: 120px) { ... }

      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '850px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    }
  },
  plugins: [
  //   require('tailwind-scrollbar-hide'),
  ],
}