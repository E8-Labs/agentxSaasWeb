/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pink-500/80': 'rgba(255, 0, 225, 0.98)',
        'green-500/80': 'rgba(34, 197, 94, 0.98)', // Custom green opacity
        'purple-500/80': 'rgba(168, 85, 247, 0.98)', // Custom purple opacity
        'bg-white/60': 'rgba(255, 255, 255, 60)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        white60: '#FFFFFF40',
        // purple: "#7902DF",
        btngray: '#E0E0E0',
        purple10: '#7902DF10',
        purple60: '#7902DF60',
        'violet-blue': '#5B0EFF',
        // green: "#01CB76",
        lightGreen: '#01CB7610',
        // red: "#FF4E4E",
        purple2: '#1C55FF',
        lightBlue: '#402fff10',
        brdColor: '#15151510',
        grayclr75: '#757575',
        darkGray: '#666666',
        // Transaction type colors
        blue: {
          100: '#DBEAFE',
          800: '#1E40AF',
        },
        scrollBarPurple: '#7902DF',
        purple: {
          DEFAULT: '#7902DF',
          100: '#F3E8FF',
          800: '#6B21A8',
        },
        green: {
          DEFAULT: '#01CB76',
          100: '#DCFCE7',
          800: '#166534',
        },
        orange: {
          100: '#FED7AA',
          800: '#9A3412',
        },
        red: {
          DEFAULT: '#FF4E4E',
          100: '#FEE2E2',
          800: '#991B1B',
        },
        indigo: {
          100: '#E0E7FF',
          800: '#3730A3',
        },
        gray: {
          100: '#F3F4F6',
          800: '#1F2937',
        },
        'thread-selected': '#F9F9F9',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // Agency branding colors (set server-side in layout.js)
        // Falls back to default purple if not set
        brand: {
          primary: 'hsl(var(--brand-primary, 270 75% 50%))', // Default: #7902DF
          secondary: 'hsl(var(--brand-secondary, 270 60% 60%))', // Default: lighter purple
        },
      },
      scrollbar: {
        width: '15px',
        colors: {
          thumb: 'hsl(var(--brand-primary, 270 75% 50%))',
          track: 'transparent',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      blur: {
        '3xl': '64px',
      },
      boxShadow: {
        custom: '0px 4px 31.5px rgba(121, 2, 223, 0.04)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }), //scrollbar plugin
    require('@tailwindcss/aspect-ratio'),
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // require("tailwind-scrollbar"),
    require('tailwindcss-animate'),
  ],
  variants: {
    scrollbar: ['rounded'], // Enable variants for scrollbar
  },
}

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
