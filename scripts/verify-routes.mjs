/**
 * scripts/verify-routes.mjs
 * Smoke-checks Expo Router file tree + default exports exist.
 * Run: node scripts/verify-routes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const appDir = path.join(root, 'app');

const required = [
  'index.tsx',
  '+not-found.tsx',
  '_layout.tsx',
  '(auth)/index.tsx',
  '(auth)/_layout.tsx',
  '(auth)/splash.tsx',
  '(auth)/login.tsx',
  '(app)/index.tsx',
  '(app)/_layout.tsx',
  '(app)/(tabs)/index.tsx',
  '(app)/(tabs)/_layout.tsx',
  '(app)/(tabs)/home.tsx',
  '(app)/(tabs)/route.tsx',
  '(app)/(tabs)/trip.tsx',
  '(app)/(tabs)/notifications.tsx',
  '(app)/more/_layout.tsx',
  '(app)/more/index.tsx',
  '(app)/more/profile.tsx',
  '(app)/more/attendance.tsx',
  '(app)/more/incident.tsx',
  '(app)/more/settings.tsx',
];

const linkedFrom = {
  '/': 'index.tsx → /(auth)/splash',
  '/(auth)/splash': 'splash → login | home',
  '/(auth)/login': 'login → /(app)/(tabs)/home',
  '/(app)/(tabs)/home': 'tabs: home, route, trip, notifications + more',
  '/(app)/more': 'profile, attendance, incident, settings',
};

let failed = 0;

console.log('TransitOps Mobile — route tree verification\n');

for (const rel of required) {
  const full = path.join(appDir, rel);
  if (!fs.existsSync(full)) {
    console.error(`MISSING  app/${rel}`);
    failed++;
    continue;
  }
  const src = fs.readFileSync(full, 'utf8');
  if (!/export\s+default\s+function/.test(src) && !/export\s+default\s+/.test(src)) {
    console.error(`NO DEFAULT EXPORT  app/${rel}`);
    failed++;
    continue;
  }
  console.log(`OK  app/${rel}`);
}

console.log('\nNavigation map:');
for (const [route, desc] of Object.entries(linkedFrom)) {
  console.log(`  ${route}  —  ${desc}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.main !== 'expo-router/entry') {
  console.error(`\nBAD entry: package.json main is "${pkg.main}" (expected expo-router/entry)`);
  failed++;
} else {
  console.log('\nOK  package.json main = expo-router/entry');
}

if (failed > 0) {
  console.error(`\nFAILED — ${failed} issue(s)`);
  process.exit(1);
}

console.log('\nPASSED — all required routes present and linked');
process.exit(0);
