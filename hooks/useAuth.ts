// ============================================================
// hooks/useAuth.ts — Hook exposing Auth Store & session logic
// ============================================================

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, logout, restoreSession, clearError } =
    useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}
