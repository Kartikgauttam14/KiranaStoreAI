import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { useActiveStoreStore } from '@/store/activeStoreStore';
import { useAsync } from '@/hooks/useAsync';
import { analyticsService, DashboardStats, LowStockItem } from '@/services/analyticsService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatCurrency';

export default function OwnerDashboardScreen() {
  const activeStore = useActiveStoreStore((state) => state.activeStore);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading: statsLoading,
    error: statsError,
    execute: refetchStats,
  } = useAsync<DashboardStats | null>(
    async () => activeStore ? await analyticsService.getDashboardStats(activeStore.id) : null,
    false
  );

  // Fetch low stock items
  const {
    data: lowStockItems,
    isLoading: stockLoading,
    execute: refetchStock,
  } = useAsync<LowStockItem[] | null>(
    async () => activeStore ? await analyticsService.getLowStockItems(activeStore.id) : null,
    false
  );

  React.useEffect(() => {
    if (activeStore) {
      refetchStats();
      refetchStock();
    }
  }, [activeStore]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchStock()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStats, refetchStock]);

  if (!activeStore) {
    return (
      <EmptyState
        icon="🏪"
        title="No Store Selected"
        message="Please create or select a store to continue"
      />
    );
  }

  // Show loading state while fetching data
  if (statsLoading) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (statsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load dashboard</Text>
          <Button label="Try Again" onPress={onRefresh} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.storeName}>{activeStore.name}</Text>
            <Text style={styles.city}>{activeStore.city}</Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <Card style={styles.summaryCard}>
              <Text style={styles.cardValue}>
                {formatCurrency(dashboardData?.todayRevenue || 0)}
              </Text>
              <Text style={styles.cardLabel}>Today's Revenue</Text>
            </Card>

            <Card style={styles.summaryCard}>
              <Text style={styles.cardValue}>{dashboardData?.ordersToday || 0}</Text>
              <Text style={styles.cardLabel}>Orders</Text>
            </Card>

            <Card style={styles.summaryCard}>
              <Text style={[styles.cardValue, { color: Colors.warning }]}>
                {dashboardData?.lowStockItems || 0}
              </Text>
              <Text style={styles.cardLabel}>Low Stock</Text>
            </Card>

            <Card style={styles.summaryCard}>
              <Text style={styles.cardValue}>{dashboardData?.billsToday || 0}</Text>
              <Text style={styles.cardLabel}>Bills Today</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Button
                label="➕ New Sale"
                onPress={() => navigation.navigate('Billing')}
                size="small"
                fullWidth
              />
              <Button
                label="📦 Inventory"
                onPress={() => navigation.navigate('Inventory')}
                size="small"
                fullWidth
              />
              <Button
                label="🔮 Forecast"
                onPress={() => navigation.navigate('Forecast')}
                size="small"
                fullWidth
              />
              <Button
                label="📊 Analytics"
                onPress={() => navigation.navigate('Analytics')}
                size="small"
                fullWidth
              />
            </View>
          </View>

          {/* Chart Section (Placeholder) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Sales</Text>
            <Card style={styles.chartCard}>
              <Text style={styles.chartPlaceholder}>
                📈 Chart coming soon
              </Text>
            </Card>
          </View>

          {/* Low Stock Alerts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
              {lowStockItems && lowStockItems.length > 0 && (
                <Button
                  label="View All"
                  onPress={() => navigation.navigate('Inventory')}
                  size="small"
                  variant="ghost"
                />
              )}
            </View>
            
            {stockLoading ? (
              <LoadingSpinner />
            ) : lowStockItems && lowStockItems.length > 0 ? (
              <FlatList
                data={lowStockItems.slice(0, 3)}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Card style={styles.alertItem}>
                    <View style={styles.alertContent}>
                      <View>
                        <Text style={styles.alertTitle}>{item.name}</Text>
                        <Text style={styles.alertSubtitle}>
                          Stock: {item.currentStock} {item.unit} (Min: {item.reorderLevel})
                        </Text>
                      </View>
                      <View style={styles.alertBadge}>
                        <Text style={styles.alertBadgeText}>Low</Text>
                      </View>
                    </View>
                  </Card>
                )}
              />
            ) : (
              <Card style={styles.alertCard}>
                <Text style={styles.alertText}>✅ All items in stock</Text>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  storeName: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  city: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  cardLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chartCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  chartPlaceholder: {
    fontSize: Typography.body1.fontSize,
    color: Colors.textSecondary,
  },
  alertCard: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  alertText: {
    fontSize: Typography.body2.fontSize,
    color: Colors.warning,
    fontWeight: '600',
  },
  alertItem: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  alertContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  alertSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  alertBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  alertBadgeText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.body1.fontSize,
    color: Colors.error,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
});
