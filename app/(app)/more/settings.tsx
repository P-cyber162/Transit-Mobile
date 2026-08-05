// ============================================================
// app/(app)/more/settings.tsx — Driver Settings Screen
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/auth.store';
import { useUIStore } from '../../../store/ui.store';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { logout } = useAuthStore();
  const {
    isDarkMode,
    toggleDarkMode,
    pushNotificationsEnabled,
    togglePushNotifications,
    language,
    setLanguage,
  } = useUIStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out Confirmation',
      'Are you sure you want to sign out of the Driver Companion app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SIGN OUT',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/splash');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Display & Appearance */}
      <Text style={styles.sectionTitle}>Appearance & Preferences</Text>
      <Card style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.textGroup}>
            <Text style={styles.settingTitle}>Dark Theme</Text>
            <Text style={styles.settingSub}>Use dark colors optimized for night driving</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityRole="switch"
            accessibilityLabel="Dark Theme"
            accessibilityState={{ checked: isDarkMode }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.textGroup}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSub}>Receive route delay and dispatch alerts</Text>
          </View>
          <Switch
            value={pushNotificationsEnabled}
            onValueChange={togglePushNotifications}
            trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityRole="switch"
            accessibilityLabel="Push Notifications"
            accessibilityState={{ checked: pushNotificationsEnabled }}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.textGroup}>
            <Text style={styles.settingTitle}>App Language</Text>
            <Text style={styles.settingSub}>English (US / GH)</Text>
          </View>
          <Text style={styles.langValue}>English</Text>
        </View>
      </Card>

      {/* Account Actions */}
      <Text style={styles.sectionTitle}>Account Actions</Text>
      <Card style={styles.card}>
        <Button
          title="LOG OUT OF DRIVER ACCOUNT"
          variant="danger"
          size="lg"
          onPress={handleLogout}
          style={styles.fullBtn}
        />
      </Card>

      {/* App Info */}
      <View style={styles.infoFooter}>
        <Text style={styles.brandTitle}>TransitOps Driver Mobile</Text>
        <Text style={styles.versionText}>Version 1.0.0 (Build 2026.08)</Text>
        <Text style={styles.subInfo}>Powered by Expo SDK 54 & Spring Boot Backend</Text>
        <Text style={styles.copyright}>© 2026 Accra Metro Transit Authority. All rights reserved.</Text>
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
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  card: {
    padding: 0,
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  textGroup: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  langValue: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  fullBtn: {
    margin: spacing.base,
  },
  infoFooter: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  subInfo: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  copyright: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 16,
  },
});
}
