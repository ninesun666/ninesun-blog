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
        card: { value: '0 2px 8px rgba(0, 0, 0, 0.08)' },
        'card-hover': { value: '0 8px 24px rgba(0, 0, 0, 0.12)' },
      },
      radii: {
        card: { value: '12px' },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: '#f8fafc', _dark: '#0f0f1a' },
          },
          subtle: {
            value: { _light: '#ffffff', _dark: '#1a1a2e' },
          },
          muted: {
            value: { _light: '#f1f5f9', _dark: '#12121f' },
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: '#1a1a2e', _dark: '#e5e7eb' },
          },
          muted: {
            value: { _light: '#6b7280', _dark: '#9ca3af' },
          },
        },
        border: {
          DEFAULT: {
            value: { _light: '#e5e7eb', _dark: '#2d2d44' },
          },
        },
        surface: {
          DEFAULT: { value: { _light: '#ffffff', _dark: '#1a1a2e' } },
          elevated: { value: { _light: '#fafafa', _dark: '#1e1e32' } },
        },
      },
    },
  },
  globalCss: {
    '.chakra-card': {
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    '.dark .chakra-card': {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    },
  },
})

export default createSystem(defaultConfig, config)