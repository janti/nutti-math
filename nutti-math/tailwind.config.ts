import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { nutti: { orange:'#F68B1E', beige:'#FFE8C2', teal:'#2BB3C0' } }
    }
  },
  plugins: [],
} satisfies Config
