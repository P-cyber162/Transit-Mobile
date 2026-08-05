// ============================================================
// theme/colors.ts — TransitOps Design Tokens
// Ported from the web app's index.css + tailwind.config.js
// ============================================================

export const colors = {
  // Brand
  primary: '#1D9E75',
  primaryLight: '#24B88A',
  primaryDark: '#167A5A',
  secondary: '#0A1628',

  // Surfaces
  surface: '#0F1E35',
  surfaceLight: '#162438',
  surfaceBorder: '#1E3048',
  surfaceElevated: '#1A2D4A',

  // Status
  statusActive: '#1D9E75',
  statusDelayed: '#EF9F27',
  statusCritical: '#D85A30',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Backgrounds
  background: '#0A1628',
  backgroundLight: '#F1F5F9',

  // Semantic
  success: '#1D9E75',
  warning: '#EF9F27',
  error: '#D85A30',
  info: '#3B82F6',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Overlays
  overlay: 'rgba(10, 22, 40, 0.7)',
  overlayLight: 'rgba(10, 22, 40, 0.4)',
} as const;

// Light mode overrides (for settings toggle)
export const lightColors = {
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceLight: '#F8FAFC',
  surfaceBorder: '#E2E8F0',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
} as const;

export type ColorToken = keyof typeof colors;
