// ============================================================
// app/(auth)/splash.tsx — Splash / Welcome Screen
// ============================================================

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { spacing, borderRadius } from '../../theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Button } from '../../components/ui/Button';

export default function Splash() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { restoreSession, isLoading } = useAuthStore();
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    let cancelled = false;
    restoreSession().then((isAuth) => {
      if (cancelled) return;
      if (isAuth) {
        router.replace('/(app)/(tabs)/home');
      } else {
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking || isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🚌</Text>
        </View>
        <Text style={styles.brandTitle}>TransitOps</Text>
        <Text style={styles.tagline}>Restoring session…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Container */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🚌</Text>
        </View>

        <Text style={styles.brandTitle}>TransitOps</Text>
        <Text style={styles.tagline}>Driver Companion Mobile</Text>
        <Text style={styles.description}>
          Perform daily shift duties, manage live campus trips, track routes, and report incidents seamlessly.
        </Text>

        <View style={styles.cardContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📍</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Real-time GPS Tracking</Text>
              <Text style={styles.featureDesc}>Automatic route sync with KNUST Transit Dispatch</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Instant Trip Controls</Text>
              <Text style={styles.featureDesc}>Start, pause, and end trips with single-tap precision</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="SIGN IN TO DRIVER PORTAL"
          variant="primary"
          size="lg"
          onPress={() => router.push('/(auth)/login')}
          style={styles.signInButton}
          accessibilityLabel="Sign in to driver portal"
        />
        <Text style={styles.copyright}>© 2026 Accra Metro Transit Authority</Text>
      </View>
    </View>
  );
}



function makeStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    padding: spacing['2xl'],
    paddingTop: 80,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
    maxWidth: 300,
  },
  cardContainer: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  featureDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  signInButton: {
    width: '100%',
  },
  copyright: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.md,
  },
});
}
