// ============================================================
// app/(app)/(tabs)/trip.tsx — Live Trip Management Screen
// Controls: Start -> Pause -> Resume -> End
// State machine enforcing valid state transitions
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tripsService } from '../../../services/trips';
import { useUIStore } from '../../../store/ui.store';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatSeconds } from '../../../utils/helpers';
import { locationTracker } from '../../../utils/locationTracker';
import { TripStatus } from '../../../types';

export default function TripScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const { showToast } = useUIStore();

  const [status, setStatus] = useState<TripStatus>('IDLE');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedStops, setCompletedStops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tripId, setTripId] = useState('TRIP-LOCAL');
  const [stops, setStops] = useState<string[]>([]);
  const [busNumber, setBusNumber] = useState<string>('');
  const [routeLabel, setRouteLabel] = useState('Assigned route');
  const [loadError, setLoadError] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    tripsService
      .getActiveTrip()
      .then((trip: any) => {
        setTripId(trip.id || 'TRIP-LOCAL');
        setStatus(trip.status || 'IDLE');
        setElapsedSeconds(trip.elapsedSeconds || 0);
        if (Array.isArray(trip.stops) && trip.stops.length > 0) {
          setStops(trip.stops);
        }
        setBusNumber(trip.busNumber || '');
        setRouteLabel(
          [trip.routeNumber, trip.routeName].filter(Boolean).join(' · ') || 'Assigned route'
        );
        if (trip.status === 'STARTED' || trip.status === 'RESUMED') {
          locationTracker.startTracking();
        }
      })
      .catch(() => {
        setLoadError(true);
        setStops([]);
      });

    return () => {
      locationTracker.stopTracking();
    };
  }, []);

  // Timer effect when trip is running
  useEffect(() => {
    if (status === 'STARTED' || status === 'RESUMED') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleStartTrip = async () => {
    setLoading(true);
    try {
      await tripsService.startTrip(tripId);
      setStatus('STARTED');
      setElapsedSeconds(0);
      setCompletedStops(stops[0] ? [stops[0]] : []);
      const gpsOk = await locationTracker.startTracking();
      showToast(
        gpsOk
          ? 'Trip STARTED. GPS location sharing is active.'
          : 'Trip STARTED. GPS permission denied — location not shared.',
        gpsOk ? 'success' : 'warning'
      );
    } catch {
      showToast('Failed to start trip.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseTrip = async () => {
    setLoading(true);
    try {
      await tripsService.pauseTrip(tripId);
      setStatus('PAUSED');
      locationTracker.stopTracking();
      showToast('Trip PAUSED. GPS sharing paused.', 'warning');
    } catch {
      showToast('Failed to pause trip.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeTrip = async () => {
    setLoading(true);
    try {
      await tripsService.resumeTrip(tripId);
      setStatus('RESUMED');
      const gpsOk = await locationTracker.startTracking();
      showToast(
        gpsOk ? 'Trip RESUMED. GPS active.' : 'Trip RESUMED without GPS.',
        gpsOk ? 'success' : 'warning'
      );
    } catch {
      showToast('Failed to resume trip.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = () => {
    Alert.alert(
      'End Trip Confirmation',
      'Are you sure you want to end this trip? Operational data will be synchronized with backend.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'END TRIP',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await tripsService.endTrip(tripId);
              setStatus('ENDED');
              locationTracker.stopTracking();
              showToast('Trip COMPLETED and saved to dispatch history.', 'success');
            } catch {
              showToast('Failed to end trip.', 'error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleStopCompletion = (stopName: string) => {
    if (status === 'IDLE' || status === 'ENDED') return;

    if (completedStops.includes(stopName)) {
      setCompletedStops((prev) => prev.filter((s) => s !== stopName));
    } else {
      setCompletedStops((prev) => [...prev, stopName]);
    }
  };

  const progressPercent =
    stops.length > 0 ? Math.round((completedStops.length / stops.length) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 8 }]}
    >
      {/* ── Top Header ───────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Trip Management</Text>
        <Text style={styles.subtitle}>Driver Duty & Route Control</Text>
      </View>

      {loadError && (
        <Card style={styles.statusCard}>
          <Text style={styles.subtitle}>Could not load active trip. Controls still work when online.</Text>
        </Card>
      )}

      {/* ── Active Trip Status Banner ─────────────────────── */}
      <Card style={styles.statusCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.routeTag}>
            {[routeLabel, busNumber ? `Bus ${busNumber}` : null].filter(Boolean).join(' • ') ||
              'No assignment'}
          </Text>
          <Badge label={status} status={status} />
        </View>

        <Text style={styles.routeName}>{routeLabel}</Text>

        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>ELAPSED TRIP TIME</Text>
          <Text style={styles.timerDisplay}>{formatSeconds(elapsedSeconds)}</Text>
        </View>

        {/* Action Controls based on State Machine */}
        <View style={styles.controlsRow}>
          {status === 'IDLE' && (
            <Button
              title="START TRIP"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleStartTrip}
              style={styles.fullBtn}
            />
          )}

          {(status === 'STARTED' || status === 'RESUMED') && (
            <>
              <Button
                title="PAUSE TRIP"
                variant="ghost"
                size="md"
                loading={loading}
                onPress={handlePauseTrip}
                style={styles.halfBtn}
              />
              <Button
                title="END TRIP"
                variant="danger"
                size="md"
                loading={loading}
                onPress={handleEndTrip}
                style={styles.halfBtn}
              />
            </>
          )}

          {status === 'PAUSED' && (
            <>
              <Button
                title="RESUME TRIP"
                variant="primary"
                size="md"
                loading={loading}
                onPress={handleResumeTrip}
                style={styles.halfBtn}
              />
              <Button
                title="END TRIP"
                variant="danger"
                size="md"
                loading={loading}
                onPress={handleEndTrip}
                style={styles.halfBtn}
              />
            </>
          )}

          {status === 'ENDED' && (
            <Button
              title="START NEW TRIP"
              variant="primary"
              size="lg"
              onPress={() => {
                setStatus('IDLE');
                setElapsedSeconds(0);
                setCompletedStops([]);
              }}
              style={styles.fullBtn}
            />
          )}
        </View>
      </Card>

      {/* ── Trip Progress Bar ────────────────────────────── */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Trip Progress</Text>
          <Text style={styles.progressPercentText}>{progressPercent}%</Text>
        </View>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        <Text style={styles.progressSub}>
          {completedStops.length} of {stops.length} stops completed
        </Text>
      </Card>

      {/* ── Stops Checklist ──────────────────────────────── */}
      <Text style={styles.sectionTitle}>Stop Checklist (local only — not synced)</Text>
      <Card style={styles.stopsCard}>
        {stops.map((stopName, idx) => {
          const isDone = completedStops.includes(stopName);
          return (
            <TouchableOpacity
              key={stopName}
              style={[
                styles.stopCheckRow,
                idx === stops.length - 1 ? { borderBottomWidth: 0 } : null,
              ]}
              onPress={() => toggleStopCompletion(stopName)}
              disabled={status === 'IDLE' || status === 'ENDED'}
            >
              <View style={[styles.checkbox, isDone ? styles.checkboxChecked : null]}>
                {isDone && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={styles.stopInfo}>
                <Text style={[styles.stopTitle, isDone ? styles.stopTitleDone : null]}>
                  {stopName}
                </Text>
                <Text style={styles.stopNum}>Stop #{idx + 1}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Card>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.base,
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
  statusCard: {
    marginBottom: spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  routeTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  routeName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  timerBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  timerLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timerDisplay: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  fullBtn: {
    width: '100%',
  },
  halfBtn: {
    flex: 1,
  },
  progressCard: {
    marginBottom: spacing.base,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressPercentText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  stopsCard: {
    padding: 0,
  },
  stopCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  stopInfo: {
    flex: 1,
  },
  stopTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  stopTitleDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stopNum: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
}
