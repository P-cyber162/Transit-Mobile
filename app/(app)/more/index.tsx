// ============================================================
// app/(app)/more/index.tsx — Driver Secondary Menu Screen
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/auth.store';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';

export default function MoreMenu() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { user } = useAuthStore();

  const menuItems = [
    {
      title: 'Driver Profile',
      subtitle: 'View license, vehicle, and employee details',
      icon: '👤',
      route: '/(app)/more/profile',
    },
    {
      title: 'Duty Attendance',
      subtitle: 'Check in, check out & view shift history',
      icon: '📋',
      route: '/(app)/more/attendance',
    },
    {
      title: 'My History',
      subtitle: 'Attendance records and reported incidents',
      icon: '🕐',
      route: '/(app)/more/history',
    },
    {
      title: 'Report Incident',
      subtitle: 'Report mechanical, traffic, safety, or passenger issues',
      icon: '⚠️',
      route: '/(app)/more/incident',
    },
    {
      title: 'Settings & Preferences',
      subtitle: 'Dark mode, notifications, language & logout',
      icon: '⚙️',
      route: '/(app)/more/settings',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Driver Card */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0] || 'D'}
            {user?.lastName?.[0] || 'R'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.role}>Registered Driver</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </Card>

      {/* Menu List */}
      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSub}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}



function makeStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.base,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  role: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  email: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  menuList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  menuSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
  },
});
}
