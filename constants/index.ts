// ============================================================
// constants/index.ts — Global Constants for Driver Mobile App
// ============================================================

/**
 * Canonical production API (same host as TransitOps web).
 * Override at runtime with EXPO_PUBLIC_API_URL, e.g.:
 *   EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api
 */
const DEFAULT_PROD_API = 'https://web-production-f8ec21.up.railway.app/api';

/** Hosts known to be decommissioned — never use as live base. */
const DEAD_API_HOSTS = ['transitops-backend-production.up.railway.app'];

const rawApi =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  DEFAULT_PROD_API;

function normalizeApiBase(url: string): string {
  let base = (url || '').trim().replace(/\/$/, '');
  if (!base || DEAD_API_HOSTS.some((host) => base.includes(host))) {
    base = DEFAULT_PROD_API;
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
