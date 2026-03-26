import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string; // 'bill', 'order', 'product', etc.
  entityId: string;
  data: Record<string, any>;
  timestamp: number;
  synced: boolean;
  syncError?: string;
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

const OFFLINE_ACTIONS_KEY = '@kirana_offline_actions';
const OFFLINE_CACHE_KEY = '@kirana_offline_cache_';
const SYNC_STATUS_KEY = '@kirana_sync_status';
const LAST_SYNC_KEY = '@kirana_last_sync';

class OfflineService {
  private isOnline = true;
  private syncInProgress = false;
  private syncListeners: Array<(syncing: boolean) => void> = [];

  /**
   * Initialize offline service and set up network listener
   */
  async initialize() {
    try {
      // Check initial connectivity
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected || false;

      // Listen for connectivity changes
      NetInfo.addEventListener((state) => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected || false;

        // Sync when connection is restored
        if (!wasOnline && this.isOnline) {
          this.syncOfflineActions();
        }

        // Notify listeners
        this.notifySyncListeners();
      });

      // Clean up stale cache on initialization
      await this.cleanupStaleCache();
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    }
  }

  /**
   * Check if currently online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Listen to sync status changes
   */
  onSyncStatusChange(listener: (syncing: boolean) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of sync status change
   */
  private notifySyncListeners() {
    this.syncListeners.forEach((listener) => listener(this.syncInProgress));
  }

  /**
   * Cache data locally with optional TTL
   */
  async cacheData(key: string, data: any, ttl?: number): Promise<void> {
    try {
      const cacheEntry: CachedData = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(
        `${OFFLINE_CACHE_KEY}${key}`,
        JSON.stringify(cacheEntry)
      );
    } catch (error) {
      console.error(`Failed to cache data for key ${key}:`, error);
    }
  }

  /**
   * Get cached data if not expired
   */
  async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`${OFFLINE_CACHE_KEY}${key}`);
      if (!cached) return null;

      const entry: CachedData = JSON.parse(cached);

      // Check if expired
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        await AsyncStorage.removeItem(`${OFFLINE_CACHE_KEY}${key}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Failed to get cached data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear specific cache entry
   */
  async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${OFFLINE_CACHE_KEY}${key}`);
    } catch (error) {
      console.error(`Failed to clear cache for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(OFFLINE_CACHE_KEY));
      (AsyncStorage as any).multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  private async cleanupStaleCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(OFFLINE_CACHE_KEY));

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const entry: CachedData = JSON.parse(cached);
          if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup stale cache:', error);
    }
  }

  /**
   * Queue an action for offline processing
   */
  async queueAction(
    type: 'create' | 'update' | 'delete',
    entity: string,
    entityId: string,
    data: Record<string, any>
  ): Promise<OfflineAction> {
    try {
      const action: OfflineAction = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        entity,
        entityId,
        data,
        timestamp: Date.now(),
        synced: false,
      };

      // Add to queue
      const actions = await this.getOfflineActions();
      actions.push(action);
      await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(actions));

      return action;
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      throw error;
    }
  }

  /**
   * Get all queued offline actions
   */
  async getOfflineActions(): Promise<OfflineAction[]> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get offline actions:', error);
      return [];
    }
  }

  /**
   * Sync offline actions when online
   */
  async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    this.notifySyncListeners();

    try {
      const actions = await this.getOfflineActions();
      const unsynced = actions.filter((a) => !a.synced);

      if (unsynced.length === 0) {
        this.syncInProgress = false;
        this.notifySyncListeners();
        return;
      }

      // Sync each action
      const results = await Promise.allSettled(
        unsynced.map((action) => this.syncAction(action))
      );

      // Update sync status
      for (let i = 0; i < unsynced.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled') {
          unsynced[i].synced = true;
        } else {
          unsynced[i].syncError = (result.reason as Error).message;
        }
      }

      // Save updated actions
      const allActions = actions.map((a) => {
        const updated = unsynced.find((u) => u.id === a.id);
        return updated || a;
      });

      await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(allActions));

      // Update last sync time
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

      console.log(`Successfully synced ${actions.filter((a) => a.synced).length} actions`);
    } catch (error) {
      console.error('Failed to sync offline actions:', error);
    } finally {
      this.syncInProgress = false;
      this.notifySyncListeners();
    }
  }

  /**
   * Sync a single offline action
   */
  private async syncAction(action: OfflineAction): Promise<void> {
    try {
      switch (action.entity) {
        case 'bill':
          await this.syncBill(action);
          break;
        case 'order':
          await this.syncOrder(action);
          break;
        case 'product':
          await this.syncProduct(action);
          break;
        case 'store':
          await this.syncStore(action);
          break;
        default:
          throw new Error(`Unknown entity type: ${action.entity}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sync bill operations
   */
  private async syncBill(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await supabase.from('bills').insert([action.data]);
        break;
      case 'update':
        await supabase
          .from('bills')
          .update(action.data)
          .eq('id', action.entityId);
        break;
      case 'delete':
        await supabase.from('bills').delete().eq('id', action.entityId);
        break;
    }
  }

  /**
   * Sync order operations
   */
  private async syncOrder(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await supabase.from('orders').insert([action.data]);
        break;
      case 'update':
        await supabase
          .from('orders')
          .update(action.data)
          .eq('id', action.entityId);
        break;
      case 'delete':
        await supabase.from('orders').delete().eq('id', action.entityId);
        break;
    }
  }

  /**
   * Sync product operations
   */
  private async syncProduct(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await supabase.from('products').insert([action.data]);
        break;
      case 'update':
        await supabase
          .from('products')
          .update(action.data)
          .eq('id', action.entityId);
        break;
      case 'delete':
        await supabase.from('products').delete().eq('id', action.entityId);
        break;
    }
  }

  /**
   * Sync store operations
   */
  private async syncStore(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await supabase.from('stores').insert([action.data]);
        break;
      case 'update':
        await supabase
          .from('stores')
          .update(action.data)
          .eq('id', action.entityId);
        break;
      case 'delete':
        await supabase.from('stores').delete().eq('id', action.entityId);
        break;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    totalActions: number;
    syncedActions: number;
    unsyncedActions: number;
    isSyncing: boolean;
    isOnline: boolean;
    lastSyncTime?: number;
  }> {
    const actions = await this.getOfflineActions();
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);

    return {
      totalActions: actions.length,
      syncedActions: actions.filter((a) => a.synced).length,
      unsyncedActions: actions.filter((a) => !a.synced).length,
      isSyncing: this.syncInProgress,
      isOnline: this.isOnline,
      lastSyncTime: lastSync ? parseInt(lastSync) : undefined,
    };
  }

  /**
   * Retry failed syncs
   */
  async retrySyncFailed(): Promise<void> {
    const actions = await this.getOfflineActions();
    const failed = actions.filter((a) => !a.synced && a.syncError);

    for (const action of failed) {
      action.synced = false;
      action.syncError = undefined;
    }

    await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
    await this.syncOfflineActions();
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_ACTIONS_KEY);
      await this.clearAllCache();
      await AsyncStorage.removeItem(SYNC_STATUS_KEY);
      await AsyncStorage.removeItem(LAST_SYNC_KEY);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  /**
   * Batch cache operations for efficiency
   */
  async cacheBatch(entries: Array<{ key: string; data: any; ttl?: number }>): Promise<void> {
    try {
      const cacheEntries = entries.map((entry) => ({
        key: `${OFFLINE_CACHE_KEY}${entry.key}`,
        value: JSON.stringify({
          key: entry.key,
          data: entry.data,
          timestamp: Date.now(),
          ttl: entry.ttl,
        } as CachedData),
      }));

      (AsyncStorage as any).multiSet(
        cacheEntries.map((entry) => [entry.key, entry.value])
      );
    } catch (error) {
      console.error('Failed to batch cache data:', error);
    }
  }
}

export const offlineService = new OfflineService();
