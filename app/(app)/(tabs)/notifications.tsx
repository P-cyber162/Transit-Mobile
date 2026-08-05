// ============================================================
// app/(app)/(tabs)/notifications.tsx — Notifications Screen
// Ported from Notifications/index.jsx in web app
// ============================================================

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationsService } from '../../../services/notifications';
import { useUIStore } from '../../../store/ui.store';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { OperationalNotification } from '../../../types';
import { useRefresh } from '../../../hooks/useRefresh';

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const { showToast } = useUIStore();
  const [notifications, setNotifications] = useState<OperationalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifs = useCallback(async () => {
    setError(null);
    try {
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (e) {
      setNotifications([]);
      setError('Unable to load notifications. Pull to retry.');
      showToast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const { refreshing, onRefresh } = useRefresh(fetchNotifs);

  const handleMarkAsRead = async (id: string) => {
    const previous = notifications;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const ok = await notificationsService.markAsRead(id);
    if (!ok) {
      setNotifications(previous);
      showToast('Could not mark notification as read.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const ok = await notificationsService.markAllRead();
    if (!ok) {
      setNotifications(previous);
      showToast('Marked locally — server sync failed.', 'warning');
      return;
    }
    showToast('All notifications marked as read.', 'success');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const allRead = unreadCount === 0;
  const isEmpty = notifications.length === 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ALERT':
        return colors.statusCritical;
      case 'SUCCESS':
        return colors.statusActive;
      default:
        return colors.info;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return '🚨';
      case 'SUCCESS':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View>
          <Text style={styles.title}>Operational Alerts</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread alert(s)` : 'All caught up!'}
          </Text>
        </View>
        {!allRead && notifications.length > 0 && (
          <Button
            title="MARK ALL READ"
            variant="ghost"
            size="sm"
            onPress={handleMarkAllRead}
            accessibilityLabel="Mark all notifications as read"
          />
        )}
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading && !refreshing ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading alerts…</Text>
          </Card>
        ) : error ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>{error}</Text>
            <Button title="RETRY" variant="primary" size="sm" onPress={fetchNotifs} style={{ marginTop: 12 }} />
          </Card>
        ) : isEmpty ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptyDesc}>
              Operational notifications will appear here when dispatch sends updates.
            </Text>
          </Card>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.read;

            return (
              <Card
                key={notif.id}
                style={[
                  styles.notifCard,
                  isUnread ? styles.unreadCard : styles.readCard,
                ]}
              >
                <View style={styles.notifRow}>
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: `${getTypeColor(notif.type)}20` },
                    ]}
                  >
                    <Text style={styles.iconText}>{getTypeIcon(notif.type)}</Text>
                  </View>

                  <View style={styles.notifBody}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.notifTitle,
                          isUnread ? styles.unreadTitle : styles.readTitle,
                        ]}
                      >
                        {notif.title}
                      </Text>
                    </View>

                    <Text style={styles.notifMsg}>{notif.message}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>

                  {isUnread && (
                    <TouchableOpacity
                      style={styles.readBtn}
                      onPress={() => handleMarkAsRead(notif.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Mark ${notif.title} as read`}
                    >
                      <Text style={styles.readBtnText}>Mark read</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}



function makeStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: 40,
    gap: spacing.md,
  },
  notifCard: {
    padding: spacing.md,
  },
  unreadCard: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderLeftWidth: 4,
  },
  readCard: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.surfaceBorder,
    opacity: 0.8,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  notifBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  unreadTitle: {
    color: colors.textPrimary,
  },
  readTitle: {
    color: colors.textSecondary,
  },
  notifMsg: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  notifTime: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 6,
    fontWeight: '600',
  },
  readBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  readBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
}
