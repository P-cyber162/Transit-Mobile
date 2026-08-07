// ============================================================
// services/pushNotifications.ts — Expo push permission & token
// ============================================================

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { ASYNC_STORAGE_KEYS } from '../constants';
import { notificationsService } from './notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('transitops-default', {
    name: 'TransitOps Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1D9E75',
  });
}

function resolveProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    undefined
  );
}

export async function getPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * Request permission, obtain Expo push token, register with backend.
 * Returns the token when permission is granted (even if backend register fails).
 */
export async function enablePushNotifications(): Promise<{
  token: string | null;
  registered: boolean;
  status: Notifications.PermissionStatus;
  error?: string;
}> {
  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  let finalStatus = current.status;
  if (finalStatus !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== 'granted') {
    return { token: null, registered: false, status: finalStatus, error: 'Permission denied' };
  }

  let token: string | null = null;
  try {
    const projectId = resolveProjectId();
    const result = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    token = result.data;
  } catch (err: any) {
    return {
      token: null,
      registered: false,
      status: finalStatus,
      error: err?.message || 'Could not get push token',
    };
  }

  if (token) {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.EXPO_PUSH_TOKEN, token);
  }

  let registered = false;
  try {
    registered = await notificationsService.registerPushToken(token || '', Platform.OS);
  } catch {
    registered = false;
  }

  return { token, registered, status: finalStatus };
}

export async function disablePushNotifications(): Promise<void> {
  const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.EXPO_PUSH_TOKEN);
  if (stored) {
    try {
      await notificationsService.unregisterPushToken(stored);
    } catch {
      /* best-effort */
    }
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.EXPO_PUSH_TOKEN);
  }
}

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler);
}
