// ============================================================
// theme/palette.ts — Dark / light palettes for runtime theme
// ============================================================

import { colors as darkBase, lightColors } from './colors';

export type ThemeColors = {
  [K in keyof typeof darkBase]: string;
};

export const darkPalette: ThemeColors = { ...darkBase };

export const lightPalette: ThemeColors = {
  ...darkBase,
  ...lightColors,
  secondary: '#F1F5F9',
  background: '#F1F5F9',
  backgroundLight: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.45)',
  overlayLight: 'rgba(15, 23, 42, 0.2)',
};

export function getPalette(isDarkMode: boolean): ThemeColors {
  return isDarkMode ? darkPalette : lightPalette;
}
