// ============================================================
// app/(app)/(tabs)/home.tsx — Production Driver Dashboard
// Displays driver profile, shift status, bus assignment, active route,
// today's trips, next departure, quick actions.
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
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/auth.store';
import { driverService } from '../../../services/driver';
import { routesService } from '../../../services/routes';
import { attendanceService } from '../../../services/attendance';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DriverShift, Route, AttendanceRecord } from '../../../types';
import { useRefresh } from '../../../hooks/useRefresh';

export default function Home() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const { user } = useAuthStore();

  const [shift, setShift] = useState<DriverShift | null>(null);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoadError(false);
    try {
      const [shiftRes, routesRes, attRes, profRes] = await Promise.allSettled([
        driverService.getCurrentShift(),
        routesService.getRoutes(),
        attendanceService.getTodayAttendance(),
        driverService.getProfile(),
      ]);

      const shiftData = shiftRes.status === 'fulfilled' ? shiftRes.value : null;
      const routesData = routesRes.status === 'fulfilled' ? routesRes.value : [];
      const attData = attRes.status === 'fulfilled' ? attRes.value : null;
      const profData = profRes.status === 'fulfilled' ? profRes.value : null;

      setShift(shiftData);
      setAttendance(attData);
      setProfile(profData);
      const matched =
        routesData.find((r) => r.number === shiftData?.routeNumber) ||
        routesData.find((r) => r.name === shiftData?.routeName) ||
        null;
      setActiveRoute(matched);
      if (
        shiftRes.status === 'rejected' &&
        routesRes.status === 'rejected' &&
        attRes.status === 'rejected' &&
        profRes.status === 'rejected'
      ) {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { refreshing, onRefresh } = useRefresh(fetchData);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 12) + 8 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* ── Driver Header ─────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.driverInfoGroup}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0] || 'D'}
              {user?.lastName?.[0] || 'R'}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.driverName}>
              {user?.firstName || 'Driver'} {user?.lastName || ''}
            </Text>
            <Text style={styles.empId}>
              Employee ID: {profile?.employeeId || user?.employeeId || '—'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(app)/more')}
          style={styles.menuBtn}
          accessibilityRole="button"
          accessibilityLabel="Open more menu"
        >
          <Text style={styles.menuIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {loadError && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>Dashboard data unavailable. Pull to refresh.</Text>
          <Button title="RETRY" variant="primary" size="sm" onPress={fetchData} style={{ marginTop: 8 }} />
        </Card>
      )}

      {/* ── Active Shift Banner ───────────────────────────── */}
      <Card style={styles.shiftCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.cardIcon}>⏱️</Text>
            <Text style={styles.cardTitle}>Current Shift</Text>
          </View>
          <Badge
            label={attendance?.status || (loading ? '…' : 'NOT CHECKED IN')}
            status={attendance?.status || 'ABSENT'}
          />
        </View>

        <Text style={styles.shiftName}>{shift?.shiftName || (loading ? 'Loading…' : 'No shift assigned')}</Text>
        <Text style={styles.shiftTime}>
          {shift ? `${shift.startTime} — ${shift.endTime}` : '—'}
        </Text>

        <View style={styles.shiftStatsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Bus Assigned</Text>
            <Text style={styles.statValue}>{shift?.busNumber || '—'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Check-In Time</Text>
            <Text style={styles.statValue}>{attendance?.checkInTime || '—'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Shift Duration</Text>
            <Text style={styles.statValue}>
              {attendance?.shiftDurationHours != null ? `${attendance.shiftDurationHours} hrs` : '—'}
            </Text>
          </View>
        </View>
      </Card>

      {/* ── Active Route Card ─────────────────────────────── */}
      <Card style={styles.routeCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleGroup}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: activeRoute?.color || colors.primary },
              ]}
            />
            <Text style={styles.cardTitle}>Assigned Route</Text>
          </View>
          {activeRoute?.number ? (
            <Badge label={activeRoute.number} status={activeRoute.status || 'Active'} />
          ) : null}
        </View>

        <Text style={styles.routeName}>
          {activeRoute?.name || shift?.routeName || 'No route assigned'}
        </Text>
        <Text style={styles.routeStopsPreview}>
          {activeRoute
            ? `Stops: ${activeRoute.startStop} → ${activeRoute.endStop}`
            : 'Pull to refresh after dispatch assigns a route.'}
        </Text>

        <View style={styles.routeActionRow}>
          <Button
            title="VIEW ROUTE MAP"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/(app)/(tabs)/route')}
          />
          <Button
            title="START NEXT TRIP"
            variant="primary"
            size="sm"
            onPress={() => router.push('/(app)/(tabs)/trip')}
          />
        </View>
      </Card>

      {/* ── Operational KPIs ─────────────────────────────── */}
      <View style={styles.kpiRow}>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Shift Window</Text>
          <Text style={styles.kpiValueText}>{shift?.startTime || '—'}</Text>
          <Text style={styles.kpiSub}>{shift ? `Ends ${shift.endTime}` : 'No schedule'}</Text>
        </Card>

        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Route Code</Text>
          <Text style={styles.kpiValueText}>{shift?.routeNumber || activeRoute?.number || '—'}</Text>
          <Text style={styles.kpiSub}>{shift?.status || 'Unassigned'}</Text>
        </Card>
      </View>

      {/* ── Quick Actions Grid ────────────────────────────── */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(app)/(tabs)/trip')}
        >
          <Text style={styles.quickIcon}>▶️</Text>
          <Text style={styles.quickTitle}>Trip Controls</Text>
          <Text style={styles.quickDesc}>Start/Pause/End</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(app)/more/attendance')}
        >
          <Text style={styles.quickIcon}>📋</Text>
          <Text style={styles.quickTitle}>Attendance</Text>
          <Text style={styles.quickDesc}>Check In / Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(app)/more/incident')}
        >
          <Text style={styles.quickIcon}>⚠️</Text>
          <Text style={styles.quickTitle}>Report Incident</Text>
          <Text style={styles.quickDesc}>Accident, Traffic, etc.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(app)/more/profile')}
        >
          <Text style={styles.quickIcon}>👤</Text>
          <Text style={styles.quickTitle}>My Profile</Text>
          <Text style={styles.quickDesc}>View details</Text>
        </TouchableOpacity>
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
  contentContainer: {
    padding: spacing.base,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  driverInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  greeting: {
    color: colors.textMuted,
    fontSize: 12,
  },
  driverName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  empId: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  shiftCard: {
    marginBottom: spacing.base,
  },
  errorCard: {
    marginBottom: spacing.base,
    alignItems: 'center',
  },
  errorText: {
    color: colors.statusCritical,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardIcon: {
    fontSize: 16,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shiftName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  shiftTime: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  shiftStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  routeCard: {
    marginBottom: spacing.base,
  },
  routeName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  routeStopsPreview: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  routeActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  kpiCard: {
    flex: 1,
  },
  kpiLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiValueText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  quickDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
}
