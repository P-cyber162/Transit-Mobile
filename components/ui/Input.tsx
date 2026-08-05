// ============================================================
// components/ui/Input.tsx — Form Input Component
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { borderRadius, spacing } from '../../theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          marginBottom: spacing.base,
          width: '100%',
        },
        label: {
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        inputContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing.md,
          height: 48,
        },
        inputError: {
          borderColor: colors.statusCritical,
        },
        input: {
          flex: 1,
          color: colors.textPrimary,
          fontSize: 14,
          height: '100%',
        },
        leftIconContainer: {
          marginRight: 4,
        },
        rightIconContainer: {
          marginLeft: 4,
        },
        errorText: {
          color: colors.statusCritical,
          fontSize: 12,
          marginTop: 4,
        },
      }),
    [colors]
  );

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? { paddingLeft: 8 } : null, style]}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label || props.placeholder || 'Input'}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
