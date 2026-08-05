// ============================================================
// app/(app)/more/incident.tsx — Incident Reporting Form
// Features GPS capture, photo attachment, category selection & offline queue
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocation } from '../../../hooks/useLocation';
import { useUIStore } from '../../../store/ui.store';
import { incidentsService } from '../../../services/incidents';
import { offlineQueue } from '../../../utils/offlineQueue';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { IncidentCategory, IncidentReport } from '../../../types';

const CATEGORIES: { label: string; value: IncidentCategory; icon: string }[] = [
  { label: 'Traffic Jam', value: 'TRAFFIC', icon: '🚦' },
  { label: 'Accident', value: 'ACCIDENT', icon: '💥' },
  { label: 'Vehicle Breakdown', value: 'VEHICLE_BREAKDOWN', icon: '🔧' },
  { label: 'Passenger Issue', value: 'PASSENGER_ISSUE', icon: '🗣️' },
  { label: 'Road Closure', value: 'ROAD_CLOSURE', icon: '🚧' },
  { label: 'Other Hazard', value: 'OTHER', icon: '⚠️' },
];

export default function IncidentScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { coords } = useLocation();
  const { isOnline, showToast } = useUIStore();

  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('TRAFFIC');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required to attach photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a brief description of the incident.');
      return;
    }

    if (!coords?.latitude || !coords?.longitude) {
      Alert.alert(
        'Location Required',
        'Enable location permission so dispatch receives accurate GPS coordinates. Fake coordinates will not be submitted.'
      );
      return;
    }

    setLoading(true);

    const report: IncidentReport = {
      category: selectedCategory,
      description: description.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp: new Date().toISOString(),
      photoUri: photoUri || undefined,
    };

    try {
      if (isOnline) {
        try {
          await incidentsService.submitReport(report);
          showToast('Incident report submitted to Transit Dispatch!', 'success');
        } catch {
          await offlineQueue.queuePendingIncident(report);
          showToast('Submit failed — report queued for retry when online.', 'warning');
        }
      } else {
        await offlineQueue.queuePendingIncident(report);
        showToast('Offline Mode: Incident report queued for sync when online.', 'warning');
      }

      if (photoUri) {
        showToast('Note: Photo is kept on-device; backend currently accepts text/GPS only.', 'info');
      }

      setDescription('');
      setPhotoUri(null);
      setSelectedCategory('TRAFFIC');
    } catch {
      showToast('Failed to submit report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Category Picker */}
      <Text style={styles.sectionHeader}>1. Select Incident Type</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryCard,
                isSelected ? styles.categoryCardSelected : null,
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.catLabel,
                  isSelected ? styles.catLabelSelected : null,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* GPS Capture Indicator */}
      <Card style={styles.gpsCard}>
        <View style={styles.gpsRow}>
          <Text style={styles.gpsIcon}>📍</Text>
          <View>
            <Text style={styles.gpsTitle}>Captured GPS Location</Text>
            <Text style={styles.gpsCoords}>
              {coords
                ? `Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`
                : '6.6745, -1.5716 (KNUST Campus Main Gate)'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Description Form */}
      <Text style={styles.sectionHeader}>2. Incident Description</Text>
      <Input
        placeholder="Provide details about the incident, lane blockage, delay severity, etc..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      {/* Photo Attachment */}
      <Text style={styles.sectionHeader}>3. Attach Photo (Optional)</Text>
      <Card style={styles.photoCard}>
        {photoUri ? (
          <View style={styles.photoPreviewGroup}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <TouchableOpacity
              style={styles.removePhotoBtn}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.removePhotoText}>Remove Photo ✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoActionRow}>
            <Button
              title="📷 TAKE PHOTO"
              variant="ghost"
              size="sm"
              onPress={handleTakePhoto}
              style={styles.halfBtn}
            />
            <Button
              title="🖼️ GALLERY"
              variant="ghost"
              size="sm"
              onPress={handlePickPhoto}
              style={styles.halfBtn}
            />
          </View>
        )}
      </Card>

      {/* Submit Button */}
      <Button
        title={loading ? 'SUBMITTING...' : 'SUBMIT INCIDENT REPORT'}
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
    fontSize: 22,
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
  gpsCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  gpsIcon: {
    fontSize: 20,
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
  },
  photoCard: {
    marginBottom: spacing.xl,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfBtn: {
    flex: 1,
  },
  photoPreviewGroup: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  removePhotoBtn: {
    paddingVertical: 4,
  },
  removePhotoText: {
    color: colors.statusCritical,
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
  },
});
}
