import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useActiveStoreStore } from '@/store/activeStoreStore';
import { useAsync } from '@/hooks/useAsync';
import { forecastService, Forecast } from '@/services/forecastService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatCurrency';

type ForecastPeriod = '7d' | '14d' | '30d';

interface ForecastCardProps {
  forecast: Forecast;
  onOrderPress: (forecast: Forecast) => void;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, onOrderPress }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod>('7d');

  const getPeriodData = (period: ForecastPeriod) => {
    switch (period) {
      case '7d':
        return { qty: forecast.forecast7d, label: '7 Days' };
      case '14d':
        return { qty: forecast.forecast14d, label: '14 Days' };
      case '30d':
        return { qty: forecast.forecast30d, label: '30 Days' };
    }
  };

  const currentData = getPeriodData(selectedPeriod);
  const confidenceColor =
    forecast.confidence === 'High'
      ? Colors.success
      : forecast.confidence === 'Medium'
      ? Colors.warning
      : Colors.danger;

  return (
    <Card style={styles.forecastCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.productName}>{forecast.productName}</Text>
          <Text style={styles.categoryChip}>{forecast.category}</Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
          <Text style={styles.confidenceText}>{forecast.confidence}</Text>
        </View>
      </View>

      {/* Stock vs Reorder Progress */}
      <View style={styles.stockSection}>
        <View style={styles.stockInfo}>
          <Text style={styles.stockLabel}>Current Stock</Text>
          <Text style={styles.stockValue}>{forecast.currentStock} units</Text>
          <Text style={styles.reorderLevel}>Reorder Level: {forecast.reorderLevel}</Text>
        </View>
        <View
          style={[
            styles.stockBar,
            {
              backgroundColor:
                forecast.currentStock <= forecast.reorderLevel
                  ? Colors.warning
                  : Colors.success,
            },
          ]}
        />
      </View>

      {/* Forecast Tabs */}
      <View style={styles.periodTabs}>
        {(['7d', '14d', '30d'] as ForecastPeriod[]).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodTab,
              selectedPeriod === period && styles.periodTabActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodTabText,
                selectedPeriod === period && styles.periodTabTextActive,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Forecast Data */}
      <View style={styles.forecastData}>
        <View>
          <Text style={styles.forecastLabel}>Predicted Demand</Text>
          <Text style={styles.forecastValue}>{Math.round(currentData.qty)} units</Text>
        </View>
        <View>
          <Text style={styles.forecastLabel}>Recommended Qty</Text>
          <Text style={styles.forecastValue}>{Math.round(forecast.recommendedQty)} units</Text>
        </View>
      </View>

      {/* Best Reorder Day */}
      {forecast.bestReorderDay && (
        <View style={styles.bestDaySection}>
          <Text style={styles.bestDayLabel}>📅 Best day to reorder:</Text>
          <Text style={styles.bestDayValue}>{forecast.bestReorderDay}</Text>
        </View>
      )}

      {/* Seasonal Note */}
      {forecast.seasonalNote && (
        <View style={styles.seasonalSection}>
          <Text style={styles.seasonalLabel}>🎉 Seasonal Note:</Text>
          <Text style={styles.seasonalText}>{forecast.seasonalNote}</Text>
        </View>
      )}

      {/* Reasoning */}
      <View style={styles.reasoningSection}>
        <Text style={styles.reasoningLabel}>AI Reasoning:</Text>
        <Text style={styles.reasoningText}>{forecast.reasoning}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {forecast.restockNow && (
          <Button
            label="📲 Order via WhatsApp"
            onPress={() => onOrderPress(forecast)}
            fullWidth
          />
        )}
      </View>
    </Card>
  );
};

export default function ForecastScreen() {
  const activeStore = useActiveStoreStore((state) => state.activeStore);
  const [refreshing, setRefreshing] = React.useState(false);
  const [restockFilter, setRestockFilter] = useState(false);

  // Fetch forecasts
  const {
    data: forecasts = [],
    loading,
    error,
    refetch,
  } = useAsync<Forecast[]>(
    () => (activeStore ? forecastService.getStorForecasts(activeStore.id) : null),
    { initialData: [] }
  );

  const filteredForecasts = restockFilter
    ? forecasts.filter((f) => f.restockNow)
    : forecasts;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const onAnalyzeAll = useCallback(async () => {
    if (!activeStore) return;
    try {
      await forecastService.generateAllForecasts(activeStore.id);
      await onRefresh();
      Alert.alert('Success', 'Forecasts updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate forecasts');
    }
  }, [activeStore, onRefresh]);

  const onOrderViaWhatsApp = (forecast: Forecast) => {
    const supplier = forecast.supplierName || 'Supplier';
    const message = `Hello ${supplier}, I need to order ${Math.round(forecast.recommendedQty)} ${forecast.unit} of ${forecast.productName}. Please confirm delivery.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('WhatsApp not available', 'Please install WhatsApp to place orders');
    });
  };

  if (!activeStore) {
    return (
      <EmptyState
        icon="🏪"
        title="No Store Selected"
        message="Please select a store to view forecasts"
      />
    );
  }

  if (loading && !forecasts.length) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🔮 AI Demand Forecast</Text>
          {forecasts.length > 0 && (
            <Text style={styles.lastUpdated}>
              Based on last 30 days of sales data
            </Text>
          )}
        </View>
        <Button
          label="Analyze All"
          onPress={onAnalyzeAll}
          size="small"
        />
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterToggle,
            restockFilter && styles.filterToggleActive,
          ]}
          onPress={() => setRestockFilter(!restockFilter)}
        >
          <Text
            style={[
              styles.filterToggleText,
              restockFilter && styles.filterToggleTextActive,
            ]}
          >
            {restockFilter ? '✓ Restock Now' : 'Show All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Forecasts List */}
      <FlatList
        data={filteredForecasts}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <ForecastCard
            forecast={item}
            onOrderPress={onOrderViaWhatsApp}
          />
        )}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              icon="📊"
              title={restockFilter ? 'No Urgent Restocks' : 'No Forecast Data'}
              message={
                restockFilter
                  ? 'All items are well stocked'
                  : 'Run "Analyze All" to generate forecasts'
              }
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
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
  lastUpdated: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  filterContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterToggle: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterToggleText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterToggleTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  forecastCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  productName: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoryChip: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  stockSection: {
    marginBottom: Spacing.md,
  },
  stockInfo: {
    marginBottom: Spacing.sm,
  },
  stockLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  stockValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  reorderLevel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  stockBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  periodTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  periodTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  periodTabActive: {
    borderBottomColor: Colors.primary,
  },
  periodTabText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodTabTextActive: {
    color: Colors.primary,
  },
  forecastData: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  forecastLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  forecastValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  bestDaySection: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bestDayLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  bestDayValue: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  seasonalSection: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
  },
  seasonalLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  seasonalText: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  reasoningSection: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  reasoningLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  reasoningText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  actionButtons: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTopWidth: 1,
    paddingTopColor: Colors.border,
  },
});
