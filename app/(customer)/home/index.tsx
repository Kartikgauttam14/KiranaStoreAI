import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useLocation } from '@/hooks/useLocation';
import { useAsync } from '@/hooks/useAsync';
import { storeService } from '@/services/storeService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { Store } from '@/types/store.types';

const CATEGORIES = [
  { id: '1', name: 'Grains', emoji: '🌾' },
  { id: '2', name: 'Dairy', emoji: '🥛' },
  { id: '3', name: 'Spices', emoji: '🌶️' },
  { id: '4', name: 'Household', emoji: '🧹' },
];

export default function CustomerHomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { location, isLoading: locationLoading, getCurrentLocation } = useLocation();

  // Fetch nearby stores
  const {
    data: storesData,
    isLoading: storesLoading,
    execute: refetchStores,
  } = useAsync(
    async () =>
      location
        ? await storeService.getNearbyStores(location.latitude, location.longitude, 5)
        : null,
    false
  );

  React.useEffect(() => {
    if (location) {
      refetchStores();
    }
  }, [location]);

  const stores = storesData?.stores || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getCurrentLocation();
      await refetchStores();
    } finally {
      setRefreshing(false);
    }
  }, [getCurrentLocation, refetchStores]);

  const onStorePress = (store: Store) => {
    navigation.navigate('StoreDetail', { storeId: store.id });
  };

  const onCategoryPress = (category: any) => {
    navigation.navigate('Stores', { category: category.name });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏪 KiranaAI</Text>
          <Text style={styles.subtitle}>Fresh products from nearby stores</Text>
        </View>

        {/* Location Card */}
        <Card style={styles.locationCard}>
          <View style={styles.locationContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>📍 Your Location</Text>
              {locationLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : location ? (
                <>
                  <Text style={styles.locationName}>
                    {location.city || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
                  </Text>
                  <Text style={styles.locationDistance}>
                    {`${(location.accuracy || 0).toFixed(0)}m accuracy`}
                  </Text>
                </>
              ) : (
                <Text style={styles.locationName}>Fetching location...</Text>
              )}
            </View>
            <Button
              label="Update"
              onPress={onRefresh}
              size="small"
              variant="secondary"
            />
          </View>
        </Card>

        {/* Browse by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📂 Browse by Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCardContainer}
                onPress={() => onCategoryPress(category)}
              >
                <Card style={styles.categoryCard}>
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nearby Stores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏪 Nearby Stores</Text>
            {stores.length > 0 && (
              <Text style={styles.storeCount}>{stores.length} stores</Text>
            )}
          </View>

          {storesLoading && !stores.length ? (
            <LoadingSpinner />
          ) : stores.length > 0 ? (
            <FlatList
              data={stores.slice(0, 10)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled
              renderItem={({ item: store }) => (
                <TouchableOpacity
                  style={styles.storeItemContainer}
                  onPress={() => onStorePress(store)}
                >
                  <Card style={styles.storeCard}>
                    {/* Store Banner */}
                    <View style={styles.storeBanner}>
                      <Text style={styles.bannerText}>
                        {store.bannerImage ? '🖼️' : '🏪'}
                      </Text>
                    </View>

                    {/* Store Info */}
                    <View style={styles.storeInfo}>
                      <View>
                        <Text style={styles.storeName}>{store.name}</Text>
                        <Text style={styles.storeCity}>{store.city}</Text>
                      </View>
                      <View style={styles.storeRating}>
                        <Text style={styles.ratingStars}>
                          ⭐ {store.rating.toFixed(1)}
                        </Text>
                        <Text style={styles.ratingCount}>
                          ({store.totalRatings})
                        </Text>
                      </View>
                    </View>

                    {/* Store Details */}
                    <View style={styles.storeDetails}>
                      <Text style={styles.detailItem}>
                        {store.isOpen ? '🟢 Open now' : '🔴 Closed'}
                      </Text>
                      <Text style={styles.detailItem}>
                        ⏱️ {store.openTime} - {store.closeTime}
                      </Text>
                      <Text style={styles.detailItem}>
                        💵 Min order: ₹{store.minOrderValue}
                      </Text>
                    </View>

                    {/* CTA */}
                    <Button
                      label="Browse Products"
                      onPress={() => onStorePress(store)}
                      fullWidth
                      size="small"
                    />
                  </Card>
                </TouchableOpacity>
              )}
            />
          ) : (
            <EmptyState
              icon="🏪"
              title="No Stores Found"
              message="No kirana stores nearby. Try updating your location."
            />
          )}
        </View>

        {/* Featured Deals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎉 Featured Deals</Text>
          <Card style={styles.dealCard}>
            <Text style={styles.dealTitle}>First Order Discount</Text>
            <Text style={styles.dealDescription}>
              Get 10% off on your first order
            </Text>
            <Button
              label="Shop Now"
              onPress={() => navigation.navigate('Stores' as never)}
              size="small"
              fullWidth
            />
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
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.md,
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
  },
  storeCount: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  locationCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  locationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  locationLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  locationName: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  locationDistance: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCardContainer: {
    flex: 1,
    minWidth: '45%',
  },
  categoryCard: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  storeItemContainer: {
    marginBottom: Spacing.md,
  },
  storeCard: {
    padding: 0,
    overflow: 'hidden',
  },
  storeBanner: {
    height: 100,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 40,
  },
  storeInfo: {
    padding: Spacing.md,
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
  storeRating: {
    alignItems: 'flex-end',
  },
  ratingStars: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.warning,
  },
  ratingCount: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  storeDetails: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  detailItem: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  dealCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.primaryLight,
  },
  dealTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  dealDescription: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    marginVertical: Spacing.md,
  },
});
