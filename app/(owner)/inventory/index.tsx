import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useActiveStoreStore } from '@/store/activeStoreStore';
import { useAsync } from '@/hooks/useAsync';
import { inventoryService } from '@/services/inventoryService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { Product } from '@/types/inventory.types';

type FilterType = 'all' | 'lowStock' | 'outOfStock' | 'expiringSoon';

export default function InventoryScreen() {
  const activeStore = useActiveStoreStore((state) => state.activeStore);
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch products
  const {
    data: productsData,
    loading,
    error,
    refetch,
  } = useAsync(
    () =>
      activeStore
        ? inventoryService.getStoreProducts(activeStore.id, {
            search: searchText,
          })
        : null,
    { initialData: null }
  );

  const products = productsData?.products || [];

  // Filter products based on selected filter
  const filteredProducts = products.filter((product: Product) => {
    if (selectedFilter === 'lowStock') {
      return (product.currentStock || 0) <= product.reorderLevel && product.currentStock > 0;
    }
    if (selectedFilter === 'outOfStock') {
      return product.currentStock === 0;
    }
    if (selectedFilter === 'expiringSoon') {
      if (!product.expiryDate) return false;
      const daysUntilExpiry = Math.floor(
        (new Date(product.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    }
    return true;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  if (!activeStore) {
    return (
      <EmptyState
        icon="🏪"
        title="No Store Selected"
        message="Please select a store to manage inventory"
      />
    );
  }

  if (loading && !products.length) {
    return <LoadingSpinner />;
  }

  const getStockBadgeColor = (product: Product) => {
    if (product.currentStock === 0) return Colors.danger;
    if (product.currentStock <= product.reorderLevel) return Colors.warning;
    return Colors.success;
  };

  const getStockLabel = (product: Product) => {
    if (product.currentStock === 0) return 'Out of Stock';
    if (product.currentStock <= product.reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📦 Inventory</Text>
        <Button
          label="+ Add Product"
          onPress={() => navigation.navigate('AddProduct')}
          size="small"
        />
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Input
                  placeholder="Search products..."
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.searchInput}
                />
              </View>

              {/* Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
              >
                {(['all', 'lowStock', 'outOfStock', 'expiringSoon'] as FilterType[]).map(
                  (filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterChip,
                        selectedFilter === filter && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedFilter(filter)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedFilter === filter && styles.filterChipTextActive,
                        ]}
                      >
                        {filter === 'all' && 'All'}
                        {filter === 'lowStock' && 'Low Stock'}
                        {filter === 'outOfStock' && 'Out of Stock'}
                        {filter === 'expiringSoon' && 'Expiring Soon'}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </>
          }
          renderItem={({ item: product }) => (
            <TouchableOpacity
              style={styles.productItem}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            >
              <Card style={styles.productCard}>
                <View style={styles.productContent}>
                  {/* Product Image */}
                  {product.imageUrl && (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    {/* Product Name and Category */}
                    <View>
                      <Text style={styles.productName}>{product.name}</Text>
                      {product.nameHindi && (
                        <Text style={styles.productNameHindi}>{product.nameHindi}</Text>
                      )}
                      <Text style={styles.productCategory}>{product.category}</Text>
                    </View>

                    {/* Stock Info */}
                    <View style={styles.stockContainer}>
                      <View>
                        <Text style={styles.stockLabel}>Stock</Text>
                        <Text style={styles.stockValue}>
                          {product.currentStock} {product.unit}
                        </Text>
                      </View>
                      <View style={[styles.stockBadge, { backgroundColor: getStockBadgeColor(product) }]}>
                        <Text style={styles.stockBadgeText}>{getStockLabel(product)}</Text>
                      </View>
                    </View>

                    {/* Price Info */}
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>
                        Cost: ₹{product.costPrice.toFixed(2)}
                      </Text>
                      <Text style={styles.priceLabel}>
                        Sell: ₹{product.sellingPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && (
              <EmptyState
                icon="📦"
                title="No Products Found"
                message={
                  searchText
                    ? `No products match "${searchText}"`
                    : 'Add your first product to get started'
                }
              />
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    fontSize: Typography.body2.fontSize,
  },
  filterContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  productItem: {
    marginBottom: Spacing.md,
  },
  productCard: {
    padding: Spacing.md,
  },
  productContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  productName: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  productNameHindi: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  productCategory: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  stockLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  stockValue: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  stockBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  stockBadgeText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  priceLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
});
