/**
 * Chakra UI Theme Configuration
 * NineSun Blog Design System v1.0
 * Based on iOS Human Interface Guidelines + Brand Purple Theme
 */

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import {
  brandColors,
  successColors,
  warningColors,
  errorColors,
  infoColors,
  grayColors,
  fonts,
  fontSizes,
  lineHeights,
  fontWeights,
  radii,
  shadows,
  easings,
  durations,
} from './tokens'

// Convert token objects to Chakra format
const createColorScale = (colors: Record<string, string>) =>
  Object.entries(colors).reduce((acc, [key, value]) => {
    acc[key] = { value }
    return acc
  }, {} as Record<string, { value: string }>)

const config = defineConfig({
  theme: {
    tokens: {
      // Typography
      fonts: {
        heading: { value: fonts.heading },
        body: { value: fonts.body },
        mono: { value: fonts.mono },
      },
      fontSizes: createColorScale(fontSizes),
      lineHeights: Object.entries(lineHeights).reduce((acc, [key, value]) => {
        acc[key] = { value: String(value) }
        return acc
      }, {} as Record<string, { value: string }>),
      fontWeights: Object.entries(fontWeights).reduce((acc, [key, value]) => {
        acc[key] = { value: String(value) }
        return acc
      }, {} as Record<string, { value: string }>),

      // Colors
      colors: {
        brand: createColorScale(brandColors),
        success: createColorScale(successColors),
        warning: createColorScale(warningColors),
        error: createColorScale(errorColors),
        info: createColorScale(infoColors),
        gray: createColorScale(grayColors),
      },

      // Shadows
      shadows: {
        xs: { value: shadows.xs },
        sm: { value: shadows.sm },
        md: { value: shadows.md },
        lg: { value: shadows.lg },
        xl: { value: shadows.xl },
        card: { value: '0 2px 12px rgba(0, 0, 0, 0.08)' },
        'card-hover': { value: '0 8px 24px rgba(0, 0, 0, 0.12)' },
        'card-dark': { value: '0 2px 12px rgba(0, 0, 0, 0.2)' },
        'card-hover-dark': { value: '0 8px 24px rgba(0, 0, 0, 0.3)' },
        dialog: { value: '0 8px 32px rgba(0, 0, 0, 0.16)' },
        menu: { value: '0 4px 16px rgba(0, 0, 0, 0.12)' },
        'button-focus': { value: '0 0 0 3px rgba(124, 58, 237, 0.1)' },
        'purple-glow': { value: '0 20px 40px -12px rgba(124, 58, 237, 0.15)' },
      },

      // Border Radius
      radii: {
        xs: { value: radii.xs },
        sm: { value: radii.sm },
        md: { value: radii.md },
        lg: { value: radii.lg },
        xl: { value: radii.xl },
        '2xl': { value: radii['2xl'] },
        '3xl': { value: radii['3xl'] },
        full: { value: radii.full },
        card: { value: '16px' },
        button: { value: '12px' },
        'button-sm': { value: '8px' },
        dialog: { value: '16px' },
        input: { value: '10px' },
        badge: { value: '6px' },
      },

      // Spacing
      spacing: {
        'button-x': { value: '24px' },
        'button-y': { value: '12px' },
        dialog: { value: '24px' },
        card: { value: '20px' },
      },
    },

    semanticTokens: {
      colors: {
        // Background
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
          elevated: {
            value: { _light: '#fafafa', _dark: '#1e1e32' },
          },
        },

        // Foreground
        fg: {
          DEFAULT: {
            value: { _light: '#1a1a2e', _dark: '#e5e7eb' },
          },
          muted: {
            value: { _light: '#6b7280', _dark: '#9ca3af' },
          },
          subtle: {
            value: { _light: '#9ca3af', _dark: '#6b7280' },
          },
          inverse: {
            value: { _light: '#ffffff', _dark: '#0f0f1a' },
          },
        },

        // Border
        border: {
          DEFAULT: {
            value: { _light: '#e5e7eb', _dark: '#2d2d44' },
          },
          subtle: {
            value: { _light: '#f3f4f6', _dark: '#1a1a2e' },
          },
          muted: {
            value: { _light: '#d1d5db', _dark: '#3d3d5c' },
          },
        },

        // Surface
        surface: {
          DEFAULT: {
            value: { _light: '#ffffff', _dark: '#1a1a2e' },
          },
          elevated: {
            value: { _light: '#fafafa', _dark: '#1e1e32' },
          },
          overlay: {
            value: { _light: 'rgba(0, 0, 0, 0.5)', _dark: 'rgba(0, 0, 0, 0.7)' },
          },
        },
      },
    },
  },

  globalCss: {
    // Card styles
    '.chakra-card': {
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      transition: `all ${durations.slow} ${easings.out}`,
    },
    '.chakra-card:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    },
    '.dark .chakra-card': {
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
    },
    '.dark .chakra-card:hover': {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    },

    // Button styles
    '.chakra-button': {
      borderRadius: '12px',
      padding: '12px 24px',
      minHeight: '44px',
      fontWeight: '600',
      transition: `all ${durations.normal} ${easings.out}`,
    },
    '.chakra-button:active:not(:disabled)': {
      transform: 'scale(0.98)',
    },
    '.chakra-button[data-size="sm"]': {
      borderRadius: '8px',
      padding: '8px 16px',
      minHeight: '32px',
      fontSize: '13px',
    },
    '.chakra-button[data-size="lg"]': {
      borderRadius: '12px',
      padding: '14px 28px',
      minHeight: '48px',
      fontSize: '16px',
    },

    // Input styles
    '.chakra-input, .chakra-textarea, .chakra-select': {
      borderRadius: '10px',
      padding: '12px 16px',
      minHeight: '44px',
      transition: `all ${durations.normal} ${easings.out}`,
    },
    '.chakra-input:focus, .chakra-textarea:focus': {
      borderWidth: '2px',
      boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
    },

    // Dialog styles
    '.chakra-dialog__content': {
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)',
    },
    '.chakra-dialog__header': {
      padding: '24px 24px 8px',
    },
    '.chakra-dialog__body': {
      padding: '8px 24px 24px',
    },
    '.chakra-dialog__footer': {
      padding: '0 24px 24px',
      gap: '12px',
    },

    // Badge styles
    '.chakra-badge': {
      borderRadius: '6px',
      padding: '4px 10px',
      fontWeight: '600',
      fontSize: '12px',
    },

    // Selection
    '::selection': {
      background: 'rgba(124, 58, 237, 0.3)',
    },
    '.dark ::selection': {
      background: 'rgba(167, 139, 250, 0.3)',
    },

    // Scrollbar
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#c4b5fd',
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: '#a78bfa',
    },
    '.dark ::-webkit-scrollbar-thumb': {
      background: '#4c1d95',
    },
    '.dark ::-webkit-scrollbar-thumb:hover': {
      background: '#5b21b6',
    },
  },
})

export default createSystem(defaultConfig, config)