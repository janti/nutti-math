import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nutti: {
          primary: '#4A90E2', // Calming blue
          secondary: '#E6F3FF', // Very light blue for backgrounds
          accent: '#0056b3', // Deep blue for text/emphasis
          warm: '#F68B1E', // Keeping orange for specific accents if needed, but renamed
        }
      }
    }
  },
  plugins: [],
} satisfies Config
