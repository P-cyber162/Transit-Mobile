// ============================================================
// app/(auth)/login.tsx — Driver Authentication Screen
// Ported from Login/index.jsx in web app with Driver-only enforcement
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { spacing, borderRadius } from '../../theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Login() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { rememberMeEmail, setRememberMeEmail } = useUIStore();

  const [email, setEmail] = useState(rememberMeEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!rememberMeEmail);

  useEffect(() => {
    if (rememberMeEmail) {
      setEmail(rememberMeEmail);
      setRememberMe(true);
    }
  }, [rememberMeEmail]);

  const handleSignIn = async () => {
    if (!email || !password) return;

    clearError();
    try {
      if (rememberMe) {
        setRememberMeEmail(email);
      } else {
        setRememberMeEmail('');
      }

      await login(email.trim(), password);
      router.replace('/(app)/(tabs)/home');
    } catch {
      // Error handled by store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🚌</Text>
          </View>
          <Text style={styles.brandTitle}>TransitOps</Text>
          <Text style={styles.subtitle}>Driver Companion Portal</Text>
          {__DEV__ ? (
            <Text style={styles.demoHint}>Demo: kwame.mensah@transitops.local / Driver@12345</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <View style={styles.divider} />

          {error && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>⚠️ {error}</Text>
            </View>
          )}

          <Input
            label="Driver Email Address"
            placeholder="e.g. driver@transitops.com"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (error) clearError();
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (error) clearError();
            }}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            }
          />

          <View style={styles.rememberRow}>
            <View style={styles.switchGroup}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
                thumbColor={colors.white}
              />
              <Text style={styles.rememberText}>Remember Me</Text>
            </View>
          </View>

          <Button
            title={isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleSignIn}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.restrictedBadge}>🔒 DRIVER ROLE ONLY</Text>
          <Text style={styles.footerText}>
            Access to this mobile client is strictly restricted to assigned transit bus drivers.
          </Text>
          <Text style={styles.copyright}>© 2026 Accra Metro Transit Authority</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}



function makeStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.base,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  demoHint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 16,
    width: 40,
    alignSelf: 'center',
  },
  errorAlert: {
    backgroundColor: 'rgba(216, 90, 48, 0.15)',
    borderColor: 'rgba(216, 90, 48, 0.3)',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorAlertText: {
    color: colors.statusCritical,
    fontSize: 13,
    lineHeight: 18,
  },
  showHideText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  submitBtn: {
    width: '100%',
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 32,
  },
  restrictedBadge: {
    color: colors.statusDelayed,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 280,
  },
  copyright: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 16,
  },
});
}
