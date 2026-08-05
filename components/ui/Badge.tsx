// ============================================================
// components/ui/Badge.tsx — Status Badge Component
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getStatusBadgeStyle } from '../../utils/helpers';
import { borderRadius } from '../../theme';

interface BadgeProps {
  label: string;
  status?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, status, style }) => {
  const badgeStyle = getStatusBadgeStyle(status || label);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: badgeStyle.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
