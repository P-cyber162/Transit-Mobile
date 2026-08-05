// ============================================================
// components/ui/Toast.tsx — Global Floating Toast Component
// ============================================================

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/ui.store';
import { borderRadius, spacing } from '../../theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useUIStore();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!toast) return null;

  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return colors.statusActive;
      case 'warning':
        return colors.statusDelayed;
      case 'error':
        return colors.statusCritical;
      default:
        return colors.info;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: getToastColor(), top: Math.max(insets.top, 12) + 8 }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={styles.text}>{toast.message}</Text>
      <TouchableOpacity
        onPress={hideToast}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

function makeStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: spacing.base,
      right: spacing.base,
      zIndex: 9999,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
    },
    text: {
      color: colors.white,
      fontWeight: '600',
      fontSize: 13,
      flex: 1,
    },
    closeBtn: {
      paddingLeft: spacing.md,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
