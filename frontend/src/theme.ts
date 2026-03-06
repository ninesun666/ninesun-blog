import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Inter', -apple-system, sans-serif" },
        body: { value: "'Inter', -apple-system, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: '#faf5ff' },
          100: { value: '#f3e8ff' },
          200: { value: '#e9d5ff' },
          300: { value: '#d8b4fe' },
          400: { value: '#c084fc' },
          500: { value: '#a855f7' },
          600: { value: '#9333ea' },
          700: { value: '#7c3aed' },
          800: { value: '#6b21a8' },
          900: { value: '#581c87' },
        },
      },
      shadows: {
        card: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)' },
        'card-hover': { value: '0 20px 40px -12px rgba(124, 58, 237, 0.15)' },
      },
    },
    semanticTokens: {
      colors: {
        surface: {
          DEFAULT: { value: '#ffffff' },
          elevated: { value: '#fafafa' },
        },
      },
    },
  },
})

export default createSystem(defaultConfig, config)
