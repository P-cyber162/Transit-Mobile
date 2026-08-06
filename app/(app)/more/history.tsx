// ============================================================
// app/(app)/more/history.tsx — Attendance + Incidents history
// Parity with web /driver/history
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { attendanceService } from '../../../services/attendance';
import { incidentsService } from '../../../services/incidents';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { AttendanceRecord, IncidentReport } from '../../../types';
import { useRefresh } from '../../../hooks/useRefresh';

export default function HistoryScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [a, i] = await Promise.all([
        attendanceService.getHistory(),
        incidentsService.getMyIncidents(),
      ]);
      setAttendance(Array.isArray(a) ? a : []);
      setIncidents(Array.isArray(i) ? i : []);
      // #region agent log
      fetch('http://127.0.0.1:7286/ingest/926a4354-0f22-4cf3-8f8e-c1576631fccf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d8ec94'},body:JSON.stringify({sessionId:'d8ec94',location:'history.tsx:load',message:'History loaded',data:{attendanceCount:Array.isArray(a)?a.length:0,incidentCount:Array.isArray(i)?i.length:0},timestamp:Date.now(),hypothesisId:'H5',runId:'pre-fix'})}).catch(()=>{});
      // #endregion
    } catch (err: any) {
      setError(err?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Loading history…</Text>
      </View>
    );
  }

  if (error && attendance.length === 0 && incidents.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" variant="primary" onPress={load} style={styles.retryBtn} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Text style={styles.pageTitle}>My history</Text>
      <Text style={styles.pageSub}>Your attendance and reported incidents only</Text>

      <Text style={styles.sectionTitle}>Attendance</Text>
      {attendance.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.muted}>No attendance records yet.</Text>
        </Card>
      ) : (
        attendance.map((row) => (
          <Card key={row.id || row.date} style={styles.rowCard}>
            <View style={styles.rowTop}>
              <Text style={styles.rowTitle}>{row.date || '—'}</Text>
              <Badge label={row.status || '—'} status={row.status} />
            </View>
            <Text style={styles.rowMeta}>
              In: {row.checkInTime || '—'} · Out: {row.checkOutTime || '—'}
            </Text>
          </Card>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Incidents</Text>
      {incidents.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.muted}>No incidents reported.</Text>
        </Card>
      ) : (
        incidents.map((row) => (
          <Card key={row.id} style={styles.rowCard}>
            <Text style={styles.rowTitle}>{row.title || row.category || 'Incident'}</Text>
            {row.description ? <Text style={styles.rowBody}>{row.description}</Text> : null}
            <Text style={styles.rowMeta}>
              {[row.severity, row.timestamp ? new Date(row.timestamp).toLocaleString() : '']
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </Card>
        ))
      )}
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
    centered: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    pageTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '700',
    },
    pageSub: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: 4,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: spacing.sm,
    },
    emptyCard: {
      padding: spacing.base,
      marginBottom: spacing.sm,
    },
    rowCard: {
      padding: spacing.base,
      marginBottom: spacing.sm,
    },
    rowTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rowTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      flex: 1,
    },
    rowBody: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
    },
    rowMeta: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 6,
    },
    muted: {
      color: colors.textMuted,
      fontSize: 13,
    },
    errorText: {
      color: colors.statusCritical,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    retryBtn: {
      minWidth: 140,
    },
  });
}
