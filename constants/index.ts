// ============================================================
// constants/index.ts — Global Constants for Driver Mobile App
// ============================================================

/**
 * API base must end with /api (no trailing slash after).
 * Override at runtime with EXPO_PUBLIC_API_URL, e.g.:
 *   EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api
 * Railway production URL is the default when env is unset.
 */
const rawApi =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'https://transitops-backend-production.up.railway.app/api';

function normalizeApiBase(url: string): string {
  let base = (url || '').trim().replace(/\/$/, '');
  if (!base) {
    base = 'https://transitops-backend-production.up.railway.app/api';
  }
  if (/^https?:\/\//.test(base) && !base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
}

export const API_BASE_URL = normalizeApiBase(rawApi);

export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'transitops_access_token',
  REFRESH_TOKEN: 'transitops_refresh_token',
  EXPIRES_AT: 'transitops_expires_at',
  USER_DATA: 'transitops_user_data',
} as const;

export const ASYNC_STORAGE_KEYS = {
  REMEMBERED_EMAIL: 'transitops_remembered_email',
  OFFLINE_CACHE_ROUTES: 'transitops_cache_routes',
  OFFLINE_CACHE_STOPS: 'transitops_cache_stops',
  OFFLINE_CACHE_SCHEDULES: 'transitops_cache_schedules',
  PENDING_INCIDENTS: 'transitops_pending_incidents',
  UI_PREFERENCES: 'transitops_ui_preferences',
} as const;

export const KNUST_CENTER_COORDS = {
  latitude: 6.6745,
  longitude: -1.5716,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

export const LOCATION_TRACKING_INTERVAL_MS = 30000; // 30s
