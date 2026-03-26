import { useEffect, useState } from 'react';
import { offlineService } from '@/services/offlineService';

export interface SyncStatus {
  totalActions: number;
  syncedActions: number;
  unsyncedActions: number;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncTime?: number;
}

/**
 * Hook for offline functionality
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(offlineService.getIsOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    // Listen for sync status changes
    const unsubscribe = offlineService.onSyncStatusChange((syncing) => {
      setIsSyncing(syncing);
    });

    // Get initial sync status
    offlineService.getSyncStatus().then(setSyncStatus);

    return unsubscribe;
  }, []);

  const refreshSyncStatus = async () => {
    const status = await offlineService.getSyncStatus();
    setSyncStatus(status);
  };

  const sync = async () => {
    setIsSyncing(true);
    try {
      await offlineService.syncOfflineActions();
      await refreshSyncStatus();
    } finally {
      setIsSyncing(false);
    }
  };

  const queueAction = async (
    type: 'create' | 'update' | 'delete',
    entity: string,
    entityId: string,
    data: Record<string, any>
  ) => {
    const action = await offlineService.queueAction(type, entity, entityId, data);
    await refreshSyncStatus();
    return action;
  };

  const retrySyncFailed = async () => {
    await offlineService.retrySyncFailed();
    await refreshSyncStatus();
  };

  return {
    isOnline,
    isSyncing,
    syncStatus,
    sync,
    queueAction,
    retrySyncFailed,
    refreshSyncStatus,
    clearOfflineData: offlineService.clearOfflineData.bind(offlineService),
  };
}
