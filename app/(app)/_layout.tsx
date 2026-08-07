// ============================================================
// app/(app)/_layout.tsx — Protected App Layout Guard
// ============================================================

import React, { useEffect, useMemo } from 'react';
import { Redirect, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { enablePushNotifications } from '../../services/pushNotifications';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function AppLayoutGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { pushNotificationsEnabled } = useUIStore();
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors]
  );

  useEffect(() => {
    if (!isAuthenticated || !pushNotificationsEnabled) return;
    enablePushNotifications().catch(() => {});
  }, [isAuthenticated, pushNotificationsEnabled]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonLoader width={120} height={120} borderRadiusValue={60} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/splash" />;
  }

  return (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="more" />
    </Stack>
  );
}
