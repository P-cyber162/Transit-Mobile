// ============================================================
// hooks/useRefresh.ts — Pull to refresh helper hook
// ============================================================

import { useState, useCallback } from 'react';

export function useRefresh(onRefreshCallback: () => Promise<any>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefreshCallback();
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshCallback]);

  return { refreshing, onRefresh };
}
