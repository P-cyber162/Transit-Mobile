// ============================================================
// components/ui/Button.tsx — Reusable Button Component
// ============================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { borderRadius } from '../../theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  ...props
}) => {
  const colors = useThemeColors();

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = styles.base;

    switch (variant) {
      case 'primary':
        base = { ...base, backgroundColor: colors.primary };
        break;
      case 'secondary':
        base = {
          ...base,
          backgroundColor: colors.surfaceLight,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        };
        break;
      case 'ghost':
        base = {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        };
        break;
      case 'danger':
        base = { ...base, backgroundColor: colors.statusCritical };
        break;
    }

    switch (size) {
      case 'sm':
        base = { ...base, paddingVertical: 6, paddingHorizontal: 12, borderRadius: borderRadius.md };
        break;
      case 'md':
        base = { ...base, paddingVertical: 12, paddingHorizontal: 18, borderRadius: borderRadius.lg };
        break;
      case 'lg':
        base = { ...base, paddingVertical: 16, paddingHorizontal: 24, borderRadius: borderRadius.xl };
        break;
    }

    if (disabled || loading) {
      base = { ...base, opacity: 0.6 };
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let baseText: TextStyle = styles.text;

    if (variant === 'ghost' || variant === 'secondary') {
      baseText = { ...baseText, color: colors.textPrimary };
    } else {
      baseText = { ...baseText, color: colors.white };
    }

    if (size === 'sm') baseText = { ...baseText, fontSize: 12 };
    if (size === 'lg') baseText = { ...baseText, fontSize: 16, fontWeight: '700' };

    return baseText;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), { minHeight: size === 'sm' ? 44 : undefined }, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.primary : colors.white} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : null, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
