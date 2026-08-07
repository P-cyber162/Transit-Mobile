// ============================================================
// app/_layout.tsx — Root Application Layout
// ============================================================

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from '../store/ui.store';
import { Toast } from '../components/ui/Toast';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { useThemeColors } from '../hooks/useThemeColors';
import { useNetwork } from '../hooks/useNetwork';
import { API_BASE_URL } from '../constants';
import {
  addNotificationResponseListener,
  enablePushNotifications,
} from '../services/pushNotifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,
    },
  },
});
// QueryClient is provided for shared caching; screens currently use local fetch + Zustand.
// Prefer useQuery for new data screens.

function NetworkMonitor() {
  const { setOnlineStatus } = useUIStore();
  useNetwork();

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const healthUrl = API_BASE_URL.replace(/\/api\/?$/, '') + '/api/health';
        const res = await fetch(healthUrl, { signal: controller.signal });
        clearTimeout(timer);
        if (!cancelled) setOnlineStatus(res.ok);
      } catch {
        // Fallback: try login endpoint OPTIONS/HEAD is blocked; assume offline only on total failure
        try {
          await fetch(API_BASE_URL, { method: 'HEAD' });
          if (!cancelled) setOnlineStatus(true);
        } catch {
          if (!cancelled) setOnlineStatus(false);
        }
      }
    };

    ping();
    const id = setInterval(ping, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [setOnlineStatus]);

  return null;
}

function RootNavigator() {
  const colors = useThemeColors();

  return (
    <>
      <StatusBar style={colors.isDarkMode ? 'light' : 'dark'} backgroundColor={colors.secondary} />
      <OfflineBanner />
      <Toast />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

function PushBootstrap() {
  const { loadPreferences, pushNotificationsEnabled } = useUIStore();

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    const sub = addNotificationResponseListener(() => {
      router.push('/(app)/(tabs)/notifications');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!pushNotificationsEnabled) return;
    // Re-register token after prefs load / login session may attach later
    enablePushNotifications().catch(() => {});
  }, [pushNotificationsEnabled]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PushBootstrap />
        <NetworkMonitor />
        <RootNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
