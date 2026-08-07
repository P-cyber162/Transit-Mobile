// ============================================================
// services/notifications.ts — Operational Notifications Service
// ============================================================

import { apiClient } from './api';
import { unwrapList, formatTimeLabel } from '../utils/apiHelpers';
import { OperationalNotification } from '../types';

function mapPriorityToType(priority?: string, category?: string): OperationalNotification['type'] {
  const p = (priority || '').toUpperCase();
  const c = (category || '').toUpperCase();
  if (p === 'HIGH' || p === 'CRITICAL' || c === 'DELAY' || c === 'ALERT') return 'ALERT';
  if (c === 'SUCCESS' || p === 'LOW') return 'INFO';
  return 'INFO';
}

function mapNotification(n: any): OperationalNotification {
  return {
    id: String(n.id),
    type: mapPriorityToType(n.priority, n.category || n.type),
    title: n.title || 'Notification',
    message: n.message || n.body || '',
    time: n.time || formatTimeLabel(n.createdAt) || '',
    read: Boolean(n.read ?? n.readFlag),
    stopName: n.stopName,
    routeNumber: n.routeNumber,
  };
}

export const notificationsService = {
  async getNotifications(): Promise<OperationalNotification[]> {
    const response = await apiClient.get('/notifications', { params: { size: 50 } });
    return unwrapList(response.data).map(mapNotification);
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      return true;
    } catch {
      return false;
    }
  },

  async markAllRead(): Promise<boolean> {
    try {
      await apiClient.post('/notifications/mark-all-read');
      return true;
    } catch {
      return false;
    }
  },

  /** Register Expo push token with backend (stored alongside web push subs). */
  async registerPushToken(token: string, platform: string = 'unknown'): Promise<boolean> {
    if (!token) return false;
    try {
      await apiClient.post('/push/device-token', { token, platform });
      return true;
    } catch {
      return false;
    }
  },

  async unregisterPushToken(token: string): Promise<boolean> {
    if (!token) return false;
    try {
      await apiClient.delete('/push/device-token', { data: { token } });
      return true;
    } catch {
      return false;
    }
  },
};
