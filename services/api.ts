// ============================================================
// services/api.ts — Central API client with Secure JWT Handling
// ============================================================

import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, SECURE_STORE_KEYS } from '../constants';
import { AuthSession, User } from '../types';

// ── JWT Utilities ────────────────────────────────────────────

function decodeJwtPayload(token: string): any {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function normalizeAuthResponse(data: any): AuthSession {
  const accessToken = data.accessToken || data.token || null;
  const refreshToken = data.refreshToken || null;

  let expiresIn = data.expiresIn || null;
  if (expiresIn !== null && expiresIn < 100_000) {
    expiresIn = expiresIn * 1000; // seconds -> milliseconds
  }

  let user: User | null = data.user || null;
  if (!user && accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      user = {
        id: payload.id ?? payload.sub ?? '',
        email: payload.email ?? payload.sub ?? '',
        firstName: payload.firstName ?? payload.given_name ?? 'Driver',
        lastName: payload.lastName ?? payload.family_name ?? '',
        role: (payload.role ?? payload.roles?.[0] ?? 'DRIVER') as any,
      };
    }
  }

  const expiresAt = expiresIn ? Date.now() + expiresIn : null;

  return {
    accessToken,
    refreshToken,
    expiresIn,
    expiresAt,
    user,
  };
}

// ── Secure Storage Helpers ───────────────────────────────────

export async function getStoredAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

export async function getStoredExpiresAt(): Promise<number | null> {
  try {
    const raw = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EXPIRES_AT);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(SECURE_STORE_KEYS.USER_DATA);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  if (session.accessToken) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, session.accessToken);
  }
  if (session.refreshToken) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, session.refreshToken);
  }
  if (session.expiresAt) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.EXPIRES_AT, String(session.expiresAt));
  }
  if (session.user) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.USER_DATA, JSON.stringify(session.user));
  }
}

export async function clearAuthSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.EXPIRES_AT);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_DATA);
  } catch (e) {
    console.warn('Error clearing auth session:', e);
  }
}

/** Called when refresh fails so Zustand can drop in-memory auth state. */
type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  onSessionExpired = handler;
}

async function forceLocalLogout() {
  await clearAuthSession();
  onSessionExpired?.();
}

// ── Axios Instance Setup ─────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getStoredAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and Token Refresh Mutex Pattern
let isRefreshing = false;
type RefreshWaiter = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let refreshSubscribers: RefreshWaiter[] = [];

function subscribeTokenRefresh(resolve: (token: string) => void, reject: (err: unknown) => void) {
  refreshSubscribers.push({ resolve, reject });
}

function resolveRefreshWaiters(newToken: string) {
  refreshSubscribers.forEach((w) => w.resolve(newToken));
  refreshSubscribers = [];
}

function rejectRefreshWaiters(err: unknown) {
  refreshSubscribers.forEach((w) => w.reject(err));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) {
        await forceLocalLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            },
            reject
          );
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const norm = normalizeAuthResponse(refreshResponse.data);
        const existingUser = await getStoredUser();
        // Persist rotated refresh token from the server — never reuse the old one
        await saveAuthSession({
          ...norm,
          user: norm.user || existingUser,
        });

        if (!norm.accessToken) {
          throw new Error('Refresh response missing access token');
        }

        resolveRefreshWaiters(norm.accessToken);
        originalRequest.headers.Authorization = `Bearer ${norm.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        rejectRefreshWaiters(refreshErr);
        await forceLocalLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
