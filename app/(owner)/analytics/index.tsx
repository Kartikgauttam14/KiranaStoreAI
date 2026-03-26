import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useActiveStoreStore } from '@/store/activeStoreStore';
import { useAsync } from '@/hooks/useAsync';
import { analyticsService } from '@/services/analyticsService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatCurrency';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
}

export default function AnalyticsScreen() {
  const activeStore = useActiveStoreStore((state) => state.activeStore);
  const [refreshing, setRefreshing] = useState(false);
  const [datePeriod, setDatePeriod] = useState<'today' | 'week' | 'month'>('week');

  // Fetch dashboard stats
  const {
    data: dashboardData,
    isLoading,
    error,
    execute: refetchStats,
  } = useAsync(
    async () => activeStore ? await analyticsService.getDashboardStats(activeStore.id) : null,
    false
  );

  // Fetch weekly sales
  const {
    data: weeklySales,
    execute: refetchWeekly,
  } = useAsync(
    async () => activeStore ? await analyticsService.getWeeklySalesData(activeStore.id) : null,
    false
  );

  // Fetch category sales
  const {
    data: categorySales,
    execute: refetchCategories,
  } = useAsync(
    async () => activeStore ? await analyticsService.getCategorySales(activeStore.id) : null,
    false
  );

  React.useEffect(() => {
    if (activeStore) {
      refetchStats();
      refetchWeekly();
      refetchCategories();
    }
  }, [activeStore]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchWeekly(), refetchCategories()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStats, refetchWeekly, refetchCategories]);

  if (!activeStore) {
    return (
      <EmptyState
        icon="🏪"
        title="No Store Selected"
        message="Please select a store to view analytics"
      />
    );
  }

  if (isLoading && !dashboardData) {
    return <LoadingSpinner />;
  }

  // Build stats cards
  const statCards: StatCard[] = [
    {
      label: "Today's Revenue",
      value: formatCurrency(dashboardData?.todayRevenue || 0),
      icon: '💰',
      color: Colors.success,
    },
    {
      label: 'Orders Today',
      value: (dashboardData?.ordersToday || 0).toString(),
      icon: '📦',
      color: Colors.primary,
    },
    {
      label: 'Bills Created',
      value: (dashboardData?.billsToday || 0).toString(),
      icon: '🧾',
      color: Colors.secondary,
    },
    {
      label: 'Low Stock Items',
      value: (dashboardData?.lowStockItems || 0).toString(),
      icon: '⚠️',
      color: Colors.warning,
    },
  ];

  // Calculate total weekly revenue
  const totalWeeklyRevenue = (weeklySales || []).reduce(
    (sum: number, item: any) => sum + (item.amount || 0),
    0
  );

  // Find max value for chart scaling
  const maxSaleAmount = Math.max(...(weeklySales || []).map((item: any) => item.amount || 0), 1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analytics</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Date Period Filter */}
          <View style={styles.periodFilter}>
            {(['today', 'week', 'month'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  datePeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setDatePeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    datePeriod === period && styles.periodButtonTextActive,
                  ]}
                >
                  {period === 'today' && 'Today'}
                  {period === 'week' && 'Week'}
                  {period === 'month' && 'Month'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* KPI Cards */}
          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>

          {/* Weekly Sales Chart */}
          {weeklySales && weeklySales.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Weekly Sales Trend</Text>
              <Text style={styles.totalAmount}>
                Total: {formatCurrency(totalWeeklyRevenue)}
              </Text>

              <View style={styles.chartContainer}>
                {weeklySales.map((day: any, index: number) => (
                  <View key={index} style={styles.chartBar}>
                    <View
                      style={[
                        styles.barColumn,
                        {
                          height: ((day.amount || 0) / maxSaleAmount) * 150,
                          backgroundColor:
                            day.amount > 0 ? Colors.primary : Colors.gray300,
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>
                      {day.day?.substring(0, 3)}
                    </Text>
                    <Text style={styles.barValue}>
                      {formatCurrency(day.amount || 0)}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Category Performance */}
          {categorySales.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>📂 Top Categories</Text>

              {categorySales.slice(0, 5).map((category: any, index: number) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <Text style={styles.categorySubtext}>
                      {category.itemCount} items
                    </Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryRevenue}>
                      {formatCurrency(category.totalSales || 0)}
                    </Text>
                    <View
                      style={[
                        styles.categoryBar,
                        {
                          width:
                            ((category.totalSales || 0) /
                              Math.max(
                                ...categorySales.map(
                                  (cat: any) => cat.totalSales || 0
                                ),
                                1
                              )) *
                            80,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Summary Stats */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Summary</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Avg Order Value</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(
                    (dashboardData?.todayRevenue || 0) /
                      Math.max(dashboardData?.billsToday || 1, 1)
                  )}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Orders/Hour</Text>
                <Text style={styles.summaryValue}>
                  {((dashboardData?.billsToday || 0) / 12).toFixed(1)}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Restock Needed</Text>
                <Text style={styles.summaryValue}>
                  {dashboardData?.lowStockItems || 0}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Pending Orders</Text>
                <Text style={styles.summaryValue}>
                  {dashboardData?.ordersToday || 0}
                </Text>
              </View>
            </View>
          </Card>

          {/* Insights Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Insights</Text>

            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>✓</Text>
              <View>
                <Text style={styles.insightTitle}>Peak Hours</Text>
                <Text style={styles.insightText}>
                  Most sales occur between 5-7 PM
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>⚠</Text>
              <View>
                <Text style={styles.insightTitle}>Low Stock Alert</Text>
                <Text style={styles.insightText}>
                  {dashboardData?.lowStockItems || 0} items need restocking
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>📈</Text>
              <View>
                <Text style={styles.insightTitle}>Top Performer</Text>
                <Text style={styles.insightText}>
                  {categorySales[0]?.category || 'N/A'} is your best category
                </Text>
              </View>
            </View>
          </Card>
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
  header: {
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
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  periodFilter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 4,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  totalAmount: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    marginVertical: Spacing.md,
  },
  chartBar: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  barColumn: {
    width: 25,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  barValue: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categorySubtext: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  categoryStats: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  categoryRevenue: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoryBar: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  summaryLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  insightItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  insightIcon: {
    fontSize: 20,
    width: 24,
  },
  insightTitle: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  insightText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
