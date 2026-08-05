// ============================================================
// components/common/OfflineBanner.tsx — Offline Indicator Banner
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/ui.store';
import { useThemeColors } from '../../hooks/useThemeColors';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useUIStore();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.statusDelayed,
          paddingTop: Math.max(insets.top, 6),
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.text, { color: colors.textInverse }]}>
        ⚠️ Offline — API unreachable. Incident reports will queue for sync.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
