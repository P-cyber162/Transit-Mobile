// ============================================================
// app/(app)/(tabs)/index.tsx — Default tab
// ============================================================

import { Redirect } from 'expo-router';

export default function TabsIndex() {
  return <Redirect href="/(app)/(tabs)/home" />;
}
