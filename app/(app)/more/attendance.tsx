// ============================================================
// app/(app)/more/attendance.tsx — Duty Attendance Screen
// ============================================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { attendanceService } from '../../../services/attendance';
import { useUIStore } from '../../../store/ui.store';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { AttendanceRecord } from '../../../types';
import { useRefresh } from '../../../hooks/useRefresh';

export default function AttendanceScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { showToast } = useUIStore();

  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendanceData = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        attendanceService.getTodayAttendance(),
        attendanceService.getHistory(),
      ]);
      setToday(todayRes);
      setHistory(historyRes);
    } catch (e) {
      console.warn('Attendance fetch error:', e);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const { refreshing, onRefresh } = useRefresh(fetchAttendanceData);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const record = await attendanceService.checkIn();
      setToday(record);
      showToast('Checked in successfully for today\'s shift!', 'success');
    } catch {
      showToast('Check in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const record = await attendanceService.checkOut();
      setToday(record);
      showToast('Checked out successfully.', 'success');
    } catch {
      showToast('Check out failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = Boolean(today?.checkInTime) && !today?.checkOutTime;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Today's Status Banner */}
      <Card style={styles.todayCard}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Today's Attendance</Text>
          <Badge label={today?.status || 'NOT CHECKED IN'} status={today?.status || 'ABSENT'} />
        </View>

        <View style={styles.timeInfoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Check-In Time</Text>
            <Text style={styles.infoValue}>{today?.checkInTime || '--:--'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Check-Out Time</Text>
            <Text style={styles.infoValue}>{today?.checkOutTime || '--:--'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Shift Duration</Text>
            <Text style={styles.infoValue}>
              {today?.shiftDurationHours ? `${today.shiftDurationHours} hrs` : '--'}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {!isCheckedIn ? (
            <Button
              title="CHECK IN FOR SHIFT"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleCheckIn}
              style={styles.fullBtn}
            />
          ) : (
            <Button
              title="CHECK OUT OF SHIFT"
              variant="danger"
              size="lg"
              loading={loading}
              onPress={handleCheckOut}
              style={styles.fullBtn}
            />
          )}
        </View>
      </Card>

      {/* Attendance History */}
      <Text style={styles.sectionTitle}>Attendance History (Past 30 Days)</Text>
      <Card style={styles.historyCard}>
        {history.length === 0 ? (
          <Text style={styles.emptyHistory}>No attendance records yet.</Text>
        ) : (
          history.map((record, idx) => (
          <View
            key={record.id}
            style={[
              styles.historyRow,
              idx === history.length - 1 ? { borderBottomWidth: 0 } : null,
            ]}
          >
            <View style={styles.historyLeft}>
              <Text style={styles.dateText}>{record.date}</Text>
              <Text style={styles.timeSubText}>
                {record.checkInTime} — {record.checkOutTime || 'Present'}
              </Text>
            </View>

            <View style={styles.historyRight}>
              <Badge label={record.status} status={record.status} />
              <Text style={styles.durationText}>
                {record.shiftDurationHours ? `${record.shiftDurationHours}h` : ''}
              </Text>
            </View>
          </View>
        ))
        )}
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
  },
  todayCard: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  timeInfoGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  actionRow: {
    marginTop: spacing.xs,
  },
  fullBtn: {
    width: '100%',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  historyCard: {
    padding: 0,
  },
  emptyHistory: {
    color: colors.textMuted,
    fontSize: 13,
    padding: spacing.base,
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  historyLeft: {
    flex: 1,
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  timeSubText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  durationText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
}
