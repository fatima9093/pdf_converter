import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        'sans': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2b3d98',
          50: '#f0f2ff',
          100: '#e6eaff',
          200: '#d1d9ff',
          300: '#a6b8ff',
          400: '#7a94ff',
          500: '#5570ff',
          600: '#2b3d98',
          700: '#243485',
          800: '#1d2a72',
          900: '#16205f',
        },
      },
    },
  },
  plugins: [],
}
export default config
