// ============================================================
// app/(app)/more/incident.tsx — Incident Reporting Form
// Parity with web /driver/incidents + optional native GPS
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../../hooks/useLocation';
import { useUIStore } from '../../../store/ui.store';
import { incidentsService } from '../../../services/incidents';
import { offlineQueue } from '../../../utils/offlineQueue';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { IncidentCategory, IncidentReport, IncidentSeverity } from '../../../types';

const CATEGORIES: {
  label: string;
  value: IncidentCategory;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: 'Mechanical', value: 'MECHANICAL', icon: 'construct-outline' },
  { label: 'Traffic', value: 'TRAFFIC', icon: 'car-outline' },
  { label: 'Safety', value: 'SAFETY', icon: 'shield-checkmark-outline' },
  { label: 'Passenger', value: 'PASSENGER', icon: 'people-outline' },
  { label: 'Other', value: 'OTHER', icon: 'warning-outline' },
];

const SEVERITIES: IncidentSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function IncidentScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { coords } = useLocation();
  const { isOnline, showToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('OTHER');
  const [severity, setSeverity] = useState<IncidentSeverity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.');
      return;
    }

    setLoading(true);

    const report: IncidentReport = {
      title: title.trim(),
      category: selectedCategory,
      severity,
      description: description.trim(),
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      timestamp: new Date().toISOString(),
    };

    try {
      if (isOnline) {
        try {
          await incidentsService.submitReport(report);
          showToast('Incident reported', 'success');
        } catch {
          await offlineQueue.queuePendingIncident(report);
          showToast('Submit failed — report queued for retry when online.', 'warning');
        }
      } else {
        await offlineQueue.queuePendingIncident(report);
        showToast('Offline Mode: Incident report queued for sync when online.', 'warning');
      }

      setTitle('');
      setDescription('');
      setSelectedCategory('OTHER');
      setSeverity('MEDIUM');
    } catch {
      showToast('Failed to submit report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeader}>Title</Text>
      <Input
        placeholder="Brief summary"
        value={title}
        onChangeText={setTitle}
        accessibilityLabel="Incident title"
      />

      <Text style={styles.sectionHeader}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              style={[styles.categoryCard, isSelected ? styles.categoryCardSelected : null]}
              onPress={() => setSelectedCategory(cat.value)}
              accessibilityRole="button"
              accessibilityLabel={cat.label}
              accessibilityState={{ selected: isSelected }}
            >
              <Ionicons
                name={cat.icon}
                size={22}
                color={isSelected ? colors.statusCritical : colors.textSecondary}
                style={styles.catIcon}
              />
              <Text style={[styles.catLabel, isSelected ? styles.catLabelSelected : null]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionHeader}>Severity</Text>
      <View style={styles.severityRow}>
        {SEVERITIES.map((s) => {
          const isSelected = severity === s;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.severityChip, isSelected ? styles.severityChipSelected : null]}
              onPress={() => setSeverity(s)}
              accessibilityRole="button"
              accessibilityLabel={`Severity ${s}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.severityText, isSelected ? styles.severityTextSelected : null]}>
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Card style={styles.gpsCard}>
        <View style={styles.gpsRow}>
          <Ionicons name="location" size={22} color={colors.primary} />
          <View>
            <Text style={styles.gpsTitle}>GPS Location (optional)</Text>
            <Text style={styles.gpsCoords}>
              {coords
                ? `Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`
                : 'Waiting for location permission…'}
            </Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Description</Text>
      <Input
        placeholder="What happened?"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.textArea}
        accessibilityLabel="Incident description"
      />

      <Button
        title={loading ? 'SUBMITTING...' : 'SUBMIT REPORT'}
        variant="danger"
        size="lg"
        loading={loading}
        onPress={handleSubmit}
        style={styles.submitBtn}
      />
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
    sectionHeader: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    categoryCard: {
      width: '31%',
      backgroundColor: colors.surface,
      borderColor: colors.surfaceBorder,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryCardSelected: {
      backgroundColor: 'rgba(216, 90, 48, 0.15)',
      borderColor: colors.statusCritical,
    },
    catIcon: {
      marginBottom: 4,
    },
    catLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    catLabelSelected: {
      color: colors.statusCritical,
      fontWeight: '800',
    },
    severityRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    severityChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      backgroundColor: colors.surface,
    },
    severityChipSelected: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(29, 158, 117, 0.15)',
    },
    severityText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    severityTextSelected: {
      color: colors.primary,
    },
    gpsCard: {
      marginTop: spacing.md,
      padding: spacing.md,
    },
    gpsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    gpsTitle: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '700',
    },
    gpsCoords: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
      paddingTop: 12,
      marginBottom: spacing.xl,
    },
    submitBtn: {
      width: '100%',
    },
  });
}
