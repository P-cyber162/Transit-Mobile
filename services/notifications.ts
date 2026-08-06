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

  /** Reserved until backend exposes an Expo push-token registration endpoint. */
  async registerPushToken(_token: string): Promise<boolean> {
    return false;
  },
};
