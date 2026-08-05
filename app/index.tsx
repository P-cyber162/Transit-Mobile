// ============================================================
// app/index.tsx — Root entry; always start at splash (session restore lives there)
// ============================================================

import { Redirect } from 'expo-router';

export default function RootIndex() {
  return <Redirect href="/(auth)/splash" />;
}
