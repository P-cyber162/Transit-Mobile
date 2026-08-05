// ============================================================
// app/(app)/index.tsx — Default authenticated landing
// ============================================================

import { Redirect } from 'expo-router';

export default function AppIndex() {
  return <Redirect href="/(app)/(tabs)/home" />;
}
