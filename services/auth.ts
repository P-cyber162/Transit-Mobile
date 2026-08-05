// ============================================================
// services/auth.ts — Auth domain service
// ============================================================

import { apiClient, normalizeAuthResponse, saveAuthSession, clearAuthSession } from './api';
import { AuthSession, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const response = await apiClient.post('/auth/login', { email, password });
    const session = normalizeAuthResponse(response.data);

    // Validate driver role
    if (session.user && session.user.role && session.user.role !== 'DRIVER') {
      throw new Error('Access restricted: Only registered Driver accounts can use this application.');
    }

    await saveAuthSession(session);
    return session;
  },

  async register(firstName: string, lastName: string, email: string, password: string): Promise<AuthSession> {
    const response = await apiClient.post('/auth/register', {
      firstName,
      lastName,
      email,
      role: 'DRIVER',
      password,
    });
    const session = normalizeAuthResponse(response.data);
    await saveAuthSession(session);
    return session;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Best-effort logout on server
    } finally {
      await clearAuthSession();
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const session = normalizeAuthResponse(response.data);
    await saveAuthSession(session);
    return session;
  },
};
