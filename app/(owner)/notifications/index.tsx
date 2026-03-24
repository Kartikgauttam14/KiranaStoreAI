import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useAuth } from '@/hooks/useAuth';
import { useAsync } from '@/hooks/useAsync';
import { notificationService, Notification, NotificationSettings } from '@/services/notificationService';
import { Colors, Typography, Spacing } from '@/constants/colors';

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onDelete,
}) => {
  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return Colors.primary;
      case 'restock':
        return Colors.warning;
      case 'delivery':
        return Colors.success;
      case 'promotional':
        return Colors.secondary;
      default:
        return Colors.info || Colors.primary;
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'restock':
        return '⚠️';
      case 'delivery':
        return '🚚';
      case 'promotional':
        return '🎉';
      default:
        return 'ℹ️';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card
      style={[
        styles.notificationCard,
        notification.read && styles.notificationCardRead,
      ] as any}
    >
      {/* Header with icon and type */}
      <View style={styles.cardHeader}>
        <View style={styles.typeSection}>
          <Text style={styles.typeIcon}>{getTypeIcon(notification.type)}</Text>
          <View style={styles.typeInfo}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationTime}>{formatTime(notification.timestamp)}</Text>
          </View>
        </View>
        {!notification.read && (
          <View style={[styles.unreadDot, { backgroundColor: getTypeColor(notification.type) }]} />
        )}
      </View>

      {/* Notification body */}
      <Text style={styles.notificationBody}>{notification.body}</Text>

      {/* Action buttons */}
      <View style={styles.cardActions}>
        {!notification.read && (
          <TouchableOpacity onPress={() => onMarkRead(notification.id)}>
            <Text style={styles.actionText}>Mark as read</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onDelete(notification.id)}>
          <Text style={[styles.actionText, styles.actionDelete]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch notifications
  const {
    data: notificationsList,
    isLoading: loading,
    execute: refetchNotifications,
  } = useAsync(
    async () => user ? await notificationService.getNotifications(user.id) : [],
    false
  );

  const notifications = notificationsList || [];

  // Fetch notification settings
  const {
    data: settings,
    execute: refetchSettings,
  } = useAsync(
    async () => user ? await notificationService.getSettings(user.id) : null,
    false
  );

  React.useEffect(() => {
    if (user) {
      refetchNotifications();
      refetchSettings();
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchNotifications(), refetchSettings()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchNotifications, refetchSettings]);

  const onMarkRead = useCallback(
    async (notificationId: string) => {
      if (!user) return;
      try {
        await notificationService.markAsRead(notificationId, user.id);
        await refetchNotifications();
      } catch (error) {
        Alert.alert('Error', 'Failed to mark notification as read');
      }
    },
    [user, refetchNotifications]
  );

  const onDelete = useCallback(
    async (notificationId: string) => {
      if (!user) return;
      try {
        await notificationService.deleteNotification(notificationId, user.id);
        await refetchNotifications();
      } catch (error) {
        Alert.alert('Error', 'Failed to delete notification');
      }
    },
    [user, refetchNotifications]
  );

  const onMarkAllRead = useCallback(async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      await refetchNotifications();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  }, [user, refetchNotifications]);

  const onDeleteAll = useCallback(async () => {
    Alert.alert('Delete All', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          if (!user) return;
          try {
            await notificationService.deleteAllNotifications(user.id);
            await refetchNotifications();
            Alert.alert('Success', 'All notifications deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete notifications');
          }
        },
        style: 'destructive',
      },
    ]);
  }, [user, refetchNotifications]);

  const onSettingChange = useCallback(
    async (setting: keyof NotificationSettings, value: boolean) => {
      if (!user || !settings) return;
      try {
        const updated = await notificationService.updateSettings(user.id, {
          [setting]: value,
        });
        await refetchSettings();
      } catch (error) {
        Alert.alert('Error', 'Failed to update notification settings');
      }
    },
    [user, settings, refetchSettings]
  );

  if (!user) {
    return (
      <EmptyState
        icon="🔔"
        title="Not Authenticated"
        message="Please log in to view notifications"
      />
    );
  }

  if (loading && !notifications.length) {
    return <LoadingSpinner />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🔔 Notifications</Text>
          {notifications.length > 0 && (
            <Text style={styles.subtitle}>
              {unreadCount} unread • {notifications.length} total
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowSettings(!showSettings)}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      {showSettings && settings && (
        <Card style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Notification Preferences</Text>

          {/* Notification Type Toggles */}
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Order Notifications</Text>
              <Text style={styles.settingSubtext}>Get updates on your orders</Text>
            </View>
            <Switch
              value={settings.ordersEnabled}
              onValueChange={(val: boolean) => onSettingChange('ordersEnabled', val)}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={settings.ordersEnabled ? Colors.primary : Colors.gray400}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Restock Alerts</Text>
              <Text style={styles.settingSubtext}>Alerts when stock is low</Text>
            </View>
            <Switch
              value={settings.restockEnabled}
              onValueChange={(val: boolean) => onSettingChange('restockEnabled', val)}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={settings.restockEnabled ? Colors.primary : Colors.gray400}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Delivery Updates</Text>
              <Text style={styles.settingSubtext}>Track delivery progress</Text>
            </View>
            <Switch
              value={settings.deliveryEnabled}
              onValueChange={(val: boolean) => onSettingChange('deliveryEnabled', val)}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={settings.deliveryEnabled ? Colors.primary : Colors.gray400}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Promotional Offers</Text>
              <Text style={styles.settingSubtext}>Discounts and special offers</Text>
            </View>
            <Switch
              value={settings.promotionalEnabled}
              onValueChange={(val: boolean) => onSettingChange('promotionalEnabled', val)}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={settings.promotionalEnabled ? Colors.primary : Colors.gray400}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Sound</Text>
              <Text style={styles.settingSubtext}>Play sound for notifications</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(val: boolean) => onSettingChange('soundEnabled', val)}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={settings.soundEnabled ? Colors.primary : Colors.gray400}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingSubtext}>Vibrate on notification</Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(val: boolean) => onSettingChange('vibrationEnabled', val)}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={settings.vibrationEnabled ? Colors.primary : Colors.gray400}
            />
          </View>
        </Card>
      )}

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <>
          {/* Action Buttons */}
          <View style={styles.actionBar}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text style={styles.actionButton}>✓ Mark all read</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity onPress={onDeleteAll}>
                <Text style={[styles.actionButton, styles.actionButtonDelete]}>
                  🗑️ Delete all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item: Notification) => item.id}
            renderItem={({ item }: { item: Notification }) => (
              <NotificationCard
                notification={item}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
          />
        </>
      ) : (
        <EmptyState
          icon="🔔"
          title="No Notifications"
          message="You're all caught up! Check back later for updates."
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  settingsButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  settingsIcon: {
    fontSize: 20,
  },
  settingsSection: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  settingsTitle: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingSubtext: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  actionBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray100,
  },
  actionButton: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  actionButtonDelete: {
    color: Colors.danger,
    borderColor: Colors.danger,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  notificationCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notificationCardRead: {
    opacity: 0.7,
    backgroundColor: Colors.gray100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  typeSection: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeIcon: {
    fontSize: 24,
  },
  typeInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notificationTime: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: Spacing.xs,
  },
  notificationBody: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: 1,
    borderTopColor: Colors.border,
  },
  actionText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.primary,
    fontWeight: '600',
  },
  actionDelete: {
    color: Colors.danger,
  },
});
