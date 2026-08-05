// ============================================================
// hooks/useNetwork.ts — Network connectivity monitor hook
// ============================================================

import { useEffect } from 'react';
import { useUIStore } from '../store/ui.store';
import { offlineQueue } from '../utils/offlineQueue';

export function useNetwork() {
  const { isOnline, setOnlineStatus, showToast } = useUIStore();

  useEffect(() => {
    // Sync offline queued reports whenever network status changes to online
    if (isOnline) {
      offlineQueue.syncPendingIncidents().then((count) => {
        if (count > 0) {
          showToast(`Synced ${count} offline incident report(s) with backend`, 'success');
        }
      });
    }
  }, [isOnline]);

  return { isOnline, setOnlineStatus };
}
