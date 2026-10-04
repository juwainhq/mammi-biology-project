/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        canvas: '#FAFAFA',
        surface: {
          DEFAULT: '#141414',
          subtle: '#1A1A1A',
          hover: '#222222',
        },
        border: {
          DEFAULT: '#242424',
          subtle: '#2E2E2E',
          strong: '#383838',
        },
        muted: '#8C8C8C',
        accent: {
          DEFAULT: '#DAAB4E', // signature warm gold
          hover: '#E5BA62',
          muted: '#8F6E2B',
          subtle: 'rgba(218, 171, 78, 0.12)',
        },
      },
      fontFamily: {
        kalpurush: ['Kalpurush', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
        noto: ['Noto Sans Bengali', 'system-ui', 'sans-serif'],
        tiro: ['Tiro Bangla', 'Noto Serif Bengali', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '1px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
      },
    },
  },
  plugins: [],
}
