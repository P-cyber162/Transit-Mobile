// ============================================================
// app/+not-found.tsx — Unknown routes → splash / home
// ============================================================

import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

export default function NotFoundScreen() {
  const colors = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: true }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Screen not found</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          That page is not part of the Driver Companion. Return to the start of the app.
        </Text>
        <Link href="/(auth)/splash" style={styles.link}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Go to TransitOps</Text>
        </Link>
        <Link href="/(app)/(tabs)/home" style={styles.link}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Open Dashboard</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  link: {
    marginTop: 4,
    paddingVertical: 8,
  },
});
