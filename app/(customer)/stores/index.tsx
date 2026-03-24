import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useLocation } from '@/hooks/useLocation';
import { useAsync } from '@/hooks/useAsync';
import { storeService } from '@/services/storeService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { Store } from '@/types/store.types';

export default function CustomerStoresScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const { location, isLoading: locationLoading, getCurrentLocation } = useLocation();

  // Fetch nearby stores
  const {
    data: storesData,
    isLoading: storesLoading,
    execute: refetch,
  } = useAsync(
    async () =>
      location
        ? await storeService.getNearbyStores(location.latitude, location.longitude, 10)
        : null,
    false
  );

  React.useEffect(() => {
    if (location) {
      refetch();
    }
  }, [location]);

  const allStores = storesData?.stores || [];

  // Filter stores
  const filteredStores = allStores.filter((store: Store) => {
    const matchesSearch =
      !searchText ||
      store.name.toLowerCase().includes(searchText.toLowerCase()) ||
      store.city.toLowerCase().includes(searchText.toLowerCase());

    const matchesRating = filterRating === 0 || store.rating >= filterRating;

    const matchesOpen = !filterOpen || store.isOpen;

    return matchesSearch && matchesRating && matchesOpen;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getCurrentLocation();
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, getCurrentLocation]);

  const onStorePress = (store: Store) => {
    navigation.navigate('StoreDetail', { storeId: store.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏪 Nearby Stores</Text>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredStores}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Search */}
              <View style={styles.searchContainer}>
                <Input
                  placeholder="Search stores..."
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              {/* Filters */}
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filterOpen && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterOpen(!filterOpen)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterOpen && styles.filterButtonTextActive,
                    ]}
                  >
                    {filterOpen ? '✓ Open' : 'Open Now'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filterRating > 0 && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterRating(filterRating > 0 ? 0 : 4)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterRating > 0 && styles.filterButtonTextActive,
                    ]}
                  >
                    {filterRating > 0 ? `✓ 4+ ⭐` : '4+ Rating'}
                  </Text>
                </TouchableOpacity>

                {(filterOpen || filterRating > 0) && (
                  <TouchableOpacity
                    onPress={() => {
                      setFilterOpen(false);
                      setFilterRating(0);
                    }}
                  >
                    <Text style={styles.clearFilter}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Store Count */}
              {filteredStores.length > 0 && (
                <Text style={styles.resultCount}>
                  {filteredStores.length} stores found
                </Text>
              )}
            </>
          }
          renderItem={({ item: store }) => (
            <TouchableOpacity
              style={styles.storeItemContainer}
              onPress={() => onStorePress(store)}
            >
              <Card style={styles.storeCard}>
                {/* Banner */}
                <View style={styles.banner}>
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerIcon}>🏪</Text>
                    {store.isOpen ? (
                      <View style={styles.openBadge}>
                        <Text style={styles.openBadgeText}>Open</Text>
                      </View>
                    ) : (
                      <View style={styles.closedBadge}>
                        <Text style={styles.closedBadgeText}>Closed</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Store Details */}
                <View style={styles.details}>
                  <View>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <Text style={styles.storeCity}>{store.city}</Text>
                  </View>

                  <View style={styles.rating}>
                    <Text style={styles.ratingText}>⭐ {store.rating.toFixed(1)}</Text>
                    <Text style={styles.ratingCount}>({store.totalRatings})</Text>
                  </View>
                </View>

                {/* Store Info Grid */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Hours</Text>
                    <Text style={styles.infoValue}>
                      {store.openTime} - {store.closeTime}
                    </Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Min Order</Text>
                    <Text style={styles.infoValue}>₹{store.minOrderValue}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Radius</Text>
                    <Text style={styles.infoValue}>{store.deliveryRadius}km</Text>
                  </View>
                </View>

                {/* CTA */}
                <Button
                  label="Browse & Order"
                  onPress={() => onStorePress(store)}
                  fullWidth
                  size="small"
                />
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !storesLoading ? (
              <EmptyState
                icon="🏪"
                title="No Stores Found"
                message={
                  searchText
                    ? `No stores match "${searchText}"`
                    : locationLoading
                    ? 'Fetching nearby stores...'
                    : 'No stores available in your area'
                }
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
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
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    fontSize: Typography.body2.fontSize,
  },
  filterContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  clearFilter: {
    fontSize: Typography.caption.fontSize,
    color: Colors.danger,
    fontWeight: '600',
  },
  resultCount: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  storeItemContainer: {
    marginBottom: Spacing.md,
  },
  storeCard: {
    padding: 0,
    overflow: 'hidden',
  },
  banner: {
    height: 100,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bannerIcon: {
    fontSize: 40,
  },
  openBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  openBadgeText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  closedBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  closedBadgeText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  details: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  storeName: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  storeCity: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  rating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.warning,
  },
  ratingCount: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  infoGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  infoItem: {
    flex: 1,
    gap: Spacing.xs,
  },
  infoLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
