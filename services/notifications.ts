// ============================================================
// services/notifications.ts — Operational Notifications Service
// ============================================================

import { apiClient } from './api';
import { unwrapList, formatTimeLabel } from '../utils/apiHelpers';
import { OperationalNotification } from '../types';
import { SEED_NOTIFICATIONS } from './notificationSeeds';

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

export { SEED_NOTIFICATIONS };

export const notificationsService = {
  async getNotifications(): Promise<OperationalNotification[]> {
    const response = await apiClient.get('/notifications', { params: { size: 50 } });
    return unwrapList(response.data).map(mapNotification);
  },

  /** Dev-only sample data — never used as a silent production fallback. */
  getDemoNotifications(): OperationalNotification[] {
    return __DEV__ ? SEED_NOTIFICATIONS : [];
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

  async registerPushToken(_token: string): Promise<boolean> {
    return false;
  },
};
