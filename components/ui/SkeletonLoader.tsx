// ============================================================
// components/ui/SkeletonLoader.tsx — Skeleton Loader Component
// ============================================================

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { borderRadius } from '../../theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadiusValue?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadiusValue = borderRadius.md,
  style,
}) => {
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: borderRadiusValue,
          opacity,
          backgroundColor: colors.surfaceLight,
        },
        style,
      ]}
      accessibilityLabel="Loading"
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {},
});
