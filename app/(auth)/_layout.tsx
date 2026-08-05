// ============================================================
// app/(auth)/_layout.tsx — Auth Group Layout
// ============================================================

import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function AuthLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      initialRouteName="splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
