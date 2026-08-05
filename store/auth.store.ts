// ============================================================
// store/auth.store.ts — Auth Zustand Store
// ============================================================

import { create } from 'zustand';
import axios from 'axios';
import { User, AuthSession } from '../types';
import { authService } from '../services/auth';
import { API_BASE_URL } from '../constants';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredExpiresAt,
  getStoredUser,
  clearAuthSession,
  saveAuthSession,
  normalizeAuthResponse,
  setSessionExpiredHandler,
} from '../services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  clearError: () => void;
  setUser: (user: User) => void;
  forceLogout: () => void;
}

function extractErrorMessage(err: any): string {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Login failed. Please check credentials.'
  );
}

function clearLocalAuth(set: (partial: Partial<AuthState>) => void) {
  set({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
}

export const useAuthStore = create<AuthState>((set) => {
  setSessionExpiredHandler(() => {
    clearLocalAuth(set);
  });

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    forceLogout: () => {
      clearLocalAuth(set);
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const session: AuthSession = await authService.login(email, password);
        if (!session.user || session.user.role !== 'DRIVER') {
          await clearAuthSession();
          throw new Error(
            'Access restricted: Only registered Driver accounts can use this application.'
          );
        }
        set({
          user: session.user,
          accessToken: session.accessToken,
          isAuthenticated: !!session.accessToken,
          isLoading: false,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: extractErrorMessage(err),
        });
        throw err;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await authService.logout();
      } finally {
        clearLocalAuth(set);
      }
    },

    restoreSession: async () => {
      set({ isLoading: true });
      try {
        let accessToken = await getStoredAccessToken();
        const refreshToken = await getStoredRefreshToken();
        const expiresAt = await getStoredExpiresAt();
        let user = await getStoredUser();

        if (!accessToken || !user || user.role !== 'DRIVER') {
          await clearAuthSession();
          clearLocalAuth(set);
          return false;
        }

        const needsRefresh = !expiresAt || expiresAt <= Date.now() + 30_000;

        if (needsRefresh) {
          if (!refreshToken) {
            await clearAuthSession();
            clearLocalAuth(set);
            return false;
          }

          try {
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });
            const norm = normalizeAuthResponse(refreshResponse.data);
            const nextUser = norm.user || user;
            if (!norm.accessToken || !nextUser || nextUser.role !== 'DRIVER') {
              await clearAuthSession();
              clearLocalAuth(set);
              return false;
            }
            await saveAuthSession({
              ...norm,
              user: nextUser,
            });
            accessToken = norm.accessToken;
            user = nextUser;
          } catch {
            await clearAuthSession();
            clearLocalAuth(set);
            return false;
          }
        }

        set({
          accessToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (e) {
        console.warn('Restore session error:', e);
        await clearAuthSession();
        clearLocalAuth(set);
        return false;
      }
    },

    clearError: () => set({ error: null }),
    setUser: (user) => set({ user }),
  };
});
