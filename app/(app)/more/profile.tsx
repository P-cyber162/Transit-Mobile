// ============================================================
// app/(app)/more/profile.tsx — Driver Profile Screen
// ============================================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../../store/auth.store';
import { driverService } from '../../../services/driver';
import { useUIStore } from '../../../store/ui.store';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { user, setUser } = useAuthStore();
  const { showToast } = useUIStore();

  const [profile, setProfile] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    driverService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setPhone(data.phone || '');
      })
      .catch(() => {
        showToast('Failed to load profile.', 'error');
      })
      .finally(() => setFetching(false));
  }, [showToast]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await driverService.updateProfile({ phone });
      setProfile((prev: any) => ({ ...prev, phone }));
      if (user) {
        setUser({ ...user, phone });
      }
      setIsEditing(false);
      showToast('Profile updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setPhone(profile?.phone || '');
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Avatar Card */}
      <Card style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0] || 'D'}
            {user?.lastName?.[0] || 'R'}
          </Text>
        </View>
        <Text style={styles.driverName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.roleTitle}>Official Bus Driver</Text>
        <Text style={styles.empIdBadge}>
          ID: {profile?.employeeId || user?.employeeId || '—'}
        </Text>
      </Card>

      {/* Driver Details List */}
      <Text style={styles.sectionHeader}>Credential & Assignment Details</Text>
      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email Address</Text>
          <Text style={styles.detailValue}>{user?.email || '—'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Driver License No.</Text>
          <Text style={styles.detailValue}>
            {fetching ? '…' : profile?.licenseNumber || '—'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>License Expiry Date</Text>
          <Text style={styles.detailValue}>
            {fetching ? '…' : profile?.licenseExpiry || '—'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Assigned Depot</Text>
          <Text style={styles.detailValue}>
            {fetching ? '…' : profile?.assignedDepot || '—'}
          </Text>
        </View>

        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.detailLabel}>Assigned Vehicle</Text>
          <Text style={styles.detailValue}>
            {fetching ? '…' : profile?.assignedVehicle || '—'}
          </Text>
        </View>
      </Card>

      {/* Editable Contact Info */}
      <Text style={styles.sectionHeader}>Contact Information</Text>
      <Card style={styles.editCard}>
        {isEditing ? (
          <>
            <Input
              label="Mobile Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.btnRow}>
              <Button
                title="CANCEL"
                variant="ghost"
                size="sm"
                onPress={handleCancelEdit}
                style={styles.halfBtn}
              />
              <Button
                title="SAVE CHANGES"
                variant="primary"
                size="sm"
                loading={loading}
                onPress={handleSave}
                style={styles.halfBtn}
              />
            </View>
          </>
        ) : (
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.detailLabel}>Mobile Phone</Text>
              <Text style={styles.detailValue}>{phone || '—'}</Text>
            </View>
            <Button
              title="EDIT"
              variant="ghost"
              size="sm"
              onPress={() => setIsEditing(true)}
            />
          </View>
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
  avatarCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 26,
  },
  driverName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  roleTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  empIdBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    backgroundColor: 'rgba(29, 158, 117, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  detailsCard: {
    padding: 0,
    marginBottom: spacing.lg,
  },
  detailRow: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  editCard: {
    marginBottom: spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  halfBtn: {
    flex: 1,
  },
});
}
