// ============================================================
// app/(auth)/index.tsx — Default auth screen
// ============================================================

import { Redirect } from 'expo-router';

export default function AuthIndex() {
  return <Redirect href="/(auth)/splash" />;
}
