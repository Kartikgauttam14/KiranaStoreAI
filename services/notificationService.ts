import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'restock' | 'delivery' | 'promotional' | 'system';
  read: boolean;
  timestamp: string;
  data?: Record<string, any>;
  actionURL?: string;
}

export interface NotificationSettings {
  ordersEnabled: boolean;
  restockEnabled: boolean;
  deliveryEnabled: boolean;
  promotionalEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  ordersEnabled: true,
  restockEnabled: true,
  deliveryEnabled: true,
  promotionalEnabled: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

const NOTIFICATIONS_CACHE_KEY = '@kirana_notifications';
const NOTIFICATION_SETTINGS_KEY = '@kirana_notification_settings';

class NotificationService {
  private initialized = false;

  /**
   * Initialize notification service
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          // Process notification in foreground
          return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          } as any;
        },
      });

      // Request user permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Get user's notification settings
   */
  async getSettings(userId: string): Promise<NotificationSettings> {
    try {
      const cached = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from backend
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const settings = data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;

      // Cache locally
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));

      return settings;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update user's notification settings
   */
  async updateSettings(userId: string, updates: Partial<NotificationSettings>) {
    try {
      // Get current settings
      const current = await this.getSettings(userId);
      const updated = { ...current, ...updates };

      // Update in database
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          ...updated,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update cache
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));

      return updated;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const cached = await AsyncStorage.getItem(NOTIFICATIONS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const notifications = (data || []).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        read: n.read,
        timestamp: n.timestamp,
        data: n.data,
        actionURL: n.action_url,
      })) as Notification[];

      // Cache locally
      await AsyncStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(notifications));

      return notifications;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      // Invalidate cache
      await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_notification_count', { p_user_id: userId });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Send local push notification
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    delay = 5000
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          badge: 1,
        },
        trigger: { type: 'time' as any, seconds: Math.ceil(delay / 1000) },
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  /**
   * Subscribe to notification updates (real-time)
   */
  subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
    // Set up real-time listener
    const subscription = (supabase as any)
      .from(`notifications:user_id=eq.${userId}`)
      .on('INSERT', (payload: any) => {
        const notification = {
          id: payload.new.id,
          title: payload.new.title,
          body: payload.new.body,
          type: payload.new.type,
          read: payload.new.read,
          timestamp: payload.new.timestamp,
          data: payload.new.data,
          actionURL: payload.new.action_url,
        } as Notification;
        onNotification(notification);
      })
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Get notifications grouped by type
   */
  async getNotificationsByType(
    userId: string,
    type: Notification['type']
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return (data || []).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        read: n.read,
        timestamp: n.timestamp,
        data: n.data,
        actionURL: n.action_url,
      }));
    } catch (error) {
      console.error('Failed to get notifications by type:', error);
      return [];
    }
  }

  /**
   * Clear notification cache
   */
  async clearCache() {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
      await AsyncStorage.removeItem(NOTIFICATION_SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to clear notification cache:', error);
    }
  }
}

export const notificationService = new NotificationService();
