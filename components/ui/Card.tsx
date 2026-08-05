// ============================================================
// components/ui/Card.tsx — Reusable Card Component
// ============================================================

import React, { useMemo } from 'react';
import { View, StyleSheet, ViewProps, ViewStyle, StyleProp } from 'react-native';
import { borderRadius, spacing } from '../../theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface CardProps extends ViewProps {
  variant?: 'default' | 'light' | 'bordered';
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'default', style, ...props }) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        defaultCard: {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
          padding: spacing.base,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: colors.isDarkMode ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 4,
        },
        lightCard: {
          backgroundColor: colors.surfaceLight,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
          padding: spacing.base,
        },
        borderedCard: {
          backgroundColor: colors.background,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
          padding: spacing.base,
        },
      }),
    [colors]
  );

  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'light':
        return styles.lightCard;
      case 'bordered':
        return styles.borderedCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};
