/**
 * Design Tokens - TypeScript
 * NineSun Blog Design System v1.0
 * Based on iOS Human Interface Guidelines + Brand Purple Theme
 */

// ========================================
// COLOR TOKENS
// ========================================

export const brandColors = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7c3aed',
  800: '#6b21a8',
  900: '#581c87',
  950: '#3b0764',
} as const;

export const successColors = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
} as const;

export const warningColors = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
} as const;

export const errorColors = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
} as const;

export const infoColors = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
} as const;

export const grayColors = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const;

// ========================================
// SEMANTIC COLORS
// ========================================

export const semanticColors = {
  light: {
    bg: {
      default: '#f8fafc',
      subtle: '#ffffff',
      muted: '#f1f5f9',
      elevated: '#fafafa',
    },
    fg: {
      default: '#1a1a2e',
      muted: '#6b7280',
      subtle: '#9ca3af',
      inverse: '#ffffff',
    },
    border: {
      default: '#e5e7eb',
      subtle: '#f3f4f6',
      muted: '#d1d5db',
    },
    surface: {
      default: '#ffffff',
      elevated: '#fafafa',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  dark: {
    bg: {
      default: '#0f0f1a',
      subtle: '#1a1a2e',
      muted: '#12121f',
      elevated: '#1e1e32',
    },
    fg: {
      default: '#e5e7eb',
      muted: '#9ca3af',
      subtle: '#6b7280',
      inverse: '#0f0f1a',
    },
    border: {
      default: '#2d2d44',
      subtle: '#1a1a2e',
      muted: '#3d3d5c',
    },
    surface: {
      default: '#1a1a2e',
      elevated: '#1e1e32',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
} as const;

// ========================================
// TYPOGRAPHY
// ========================================

export const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', SFMono-Regular, Consolas, monospace",
} as const;

export const fontSizes = {
  xs: '12px',
  sm: '13px',
  md: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '32px',
  '5xl': '40px',
  '6xl': '48px',
} as const;

export const lineHeights = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const letterSpacings = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
} as const;

// ========================================
// SPACING
// ========================================

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ========================================
// BORDER RADIUS
// ========================================

export const radii = {
  none: '0',
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '20px',
  full: '9999px',
} as const;

// Component-specific radii
export const componentRadii = {
  button: '12px',
  buttonSm: '8px',
  card: '16px',
  dialog: '16px',
  input: '10px',
  badge: '6px',
} as const;

// ========================================
// SHADOWS
// ========================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
} as const;

export const componentShadows = {
  card: '0 2px 12px rgba(0, 0, 0, 0.08)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.12)',
  cardDark: '0 2px 12px rgba(0, 0, 0, 0.2)',
  cardHoverDark: '0 8px 24px rgba(0, 0, 0, 0.3)',
  dialog: '0 8px 32px rgba(0, 0, 0, 0.16)',
  menu: '0 4px 16px rgba(0, 0, 0, 0.12)',
  buttonFocus: '0 0 0 3px rgba(124, 58, 237, 0.1)',
  purpleGlow: '0 20px 40px -12px rgba(124, 58, 237, 0.15)',
} as const;

// ========================================
// TRANSITIONS
// ========================================

export const durations = {
  instant: '0ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

export const easings = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// ========================================
// Z-INDEX
// ========================================

export const zIndices = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 100,
  sticky: 200,
  banner: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  skipLink: 700,
  toast: 800,
  tooltip: 900,
} as const;

// ========================================
// BREAKPOINTS
// ========================================

export const breakpoints = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ========================================
// COMPONENT TOKENS
// ========================================

export const buttonTokens = {
  paddingX: '24px',
  paddingY: '12px',
  paddingXSm: '16px',
  paddingYSm: '8px',
  paddingXLg: '28px',
  paddingYLg: '14px',
  minHeight: '44px',
  minHeightSm: '32px',
  minHeightLg: '48px',
  iconSize: '36px',
} as const;

export const cardTokens = {
  padding: '20px',
  paddingSm: '12px',
  paddingLg: '24px',
} as const;

export const dialogTokens = {
  padding: '24px',
  gapTitle: '16px',
  gapContent: '24px',
  gapButtons: '12px',
  maxWidth: '480px',
} as const;

export const inputTokens = {
  padding: '12px 16px',
  minHeight: '44px',
} as const;

export const tableTokens = {
  padding: '16px',
  paddingSm: '12px',
} as const;

// ========================================
// OPACITY
// ========================================

export const opacity = {
  0: 0,
  25: 0.25,
  50: 0.5,
  75: 0.75,
  100: 1,
  disabled: 0.5,
  hover: 0.1,
  active: 0.2,
} as const;

// ========================================
// EXPORT ALL TOKENS
// ========================================

export const tokens = {
  colors: {
    brand: brandColors,
    success: successColors,
    warning: warningColors,
    error: errorColors,
    info: infoColors,
    gray: grayColors,
    semantic: semanticColors,
  },
  fonts,
  fontSizes,
  lineHeights,
  fontWeights,
  letterSpacings,
  spacing,
  radii: { ...radii, ...componentRadii },
  shadows: { ...shadows, ...componentShadows },
  durations,
  easings,
  zIndices,
  breakpoints,
  components: {
    button: buttonTokens,
    card: cardTokens,
    dialog: dialogTokens,
    input: inputTokens,
    table: tableTokens,
  },
  opacity,
} as const;

export default tokens;
