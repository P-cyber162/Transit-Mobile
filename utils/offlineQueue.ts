// ============================================================
// utils/offlineQueue.ts — Offline Queue & Cache Service
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS } from '../constants';
import { IncidentReport } from '../types';
import { incidentsService } from '../services/incidents';

let syncInFlight: Promise<number> | null = null;

export const offlineQueue = {
  async cacheData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Cache write error:', e);
    }
  },

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async queuePendingIncident(report: IncidentReport): Promise<void> {
    try {
      const existing =
        (await this.getCachedData<IncidentReport[]>(ASYNC_STORAGE_KEYS.PENDING_INCIDENTS)) || [];
      existing.push(report);
      await this.cacheData(ASYNC_STORAGE_KEYS.PENDING_INCIDENTS, existing);
    } catch (e) {
      console.warn('Queue incident error:', e);
    }
  },

  async syncPendingIncidents(): Promise<number> {
    if (syncInFlight) return syncInFlight;

    syncInFlight = (async () => {
      try {
        const pending = await this.getCachedData<IncidentReport[]>(
          ASYNC_STORAGE_KEYS.PENDING_INCIDENTS
        );
        if (!pending || pending.length === 0) return 0;

        let syncedCount = 0;
        const remaining: IncidentReport[] = [];

        for (const item of pending) {
          try {
            await incidentsService.submitReport(item);
            syncedCount++;
          } catch {
            remaining.push(item);
          }
        }

        await this.cacheData(ASYNC_STORAGE_KEYS.PENDING_INCIDENTS, remaining);
        return syncedCount;
      } catch {
        return 0;
      } finally {
        syncInFlight = null;
      }
    })();

    return syncInFlight;
  },
};
