// ============================================================
// hooks/useThemeColors.ts — Reactive theme palette hook
// ============================================================

import { useMemo } from 'react';
import { useUIStore } from '../store/ui.store';
import { getPalette, ThemeColors } from '../theme/palette';
import { spacing, borderRadius, iconSize } from '../theme/spacing';
import { fontFamily, fontSize, lineHeight, letterSpacing } from '../theme/typography';

export function useThemeColors(): ThemeColors & { isDarkMode: boolean } {
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const colors = useMemo(() => getPalette(isDarkMode), [isDarkMode]);
  return { ...colors, isDarkMode };
}

export function useTheme() {
  const palette = useThemeColors();
  return {
    colors: palette,
    isDarkMode: palette.isDarkMode,
    spacing,
    borderRadius,
    iconSize,
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing,
  };
}
