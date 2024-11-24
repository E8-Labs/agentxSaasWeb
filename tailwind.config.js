/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        purple: "#402FFF",
        green: "#01CB76",
        red: "#FF4E4E",
        purple2: "#1C55FF"
      },
      scrollbar: {
        width: '15px', // Customize scrollbar width
        colors: {
          thumb: '#402FFF', // Scrollbar thumb (the draggable part)
          track: 'transparent', // Scrollbar track (background)
        },
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }), //scrollbar plugin
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
  variants: {
    scrollbar: ['rounded'], // Enable variants for scrollbar
  },
};


// module.exports = {
//   content: ['./pages/*/.{js,ts,jsx,tsx}', './components/*/.{js,ts,jsx,tsx}', './app/*/.{js,ts,jsx,tsx}'],
//   theme: {
//     extend: {},
//   },
//   plugins: [
//     require('@tailwindcss/aspect-ratio'),
//     require('@tailwindcss/forms'),
//     require('@tailwindcss/typography'),
//     require('tailwind-scrollbar'),
//   ],
// };