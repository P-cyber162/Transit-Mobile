// ============================================================
// components/ui/EmptyState.tsx — Reusable Empty State Component
// ============================================================

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '../../theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, style]} accessibilityRole="summary">
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="ghost"
          size="sm"
          style={styles.button}
          accessibilityLabel={actionTitle}
        />
      )}
    </View>
  );
};

function makeStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: {
      padding: spacing['2xl'],
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      marginVertical: spacing.md,
    },
    iconContainer: {
      marginBottom: spacing.md,
      opacity: 0.8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    description: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 18,
    },
    button: {
      marginTop: spacing.lg,
    },
  });
}
