import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useAsync } from '@/hooks/useAsync';
import { useCartStore } from '@/store/cartStore';
import { storeService } from '@/services/storeService';
import { inventoryService } from '@/services/inventoryService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatCurrency';
import { Store } from '@/types/store.types';
import { Product } from '@/types/inventory.types';

interface RouteParams {
  storeId: string;
}

export default function StoreDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { storeId } = (route.params as RouteParams) || {};

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addQuantity, setAddQuantity] = useState(1);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const cartStoreId = useCartStore((state) => state.storeId);

  // Fetch store details
  const {
    data: storeData,
    isLoading: storeLoading,
    error: storeError,
    execute: refetchStore,
  } = useAsync(async () => storeService.getStore(storeId!), false);

  React.useEffect(() => {
    if (storeId) {
      refetchStore();
    }
  }, [storeId]);

  const store: Store | null = storeData?.store || null;

  // Fetch products
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    execute: refetchProducts,
  } = useAsync(
    async () =>
      storeId
        ? await inventoryService.getStoreProducts(storeId, {
            search: searchText || undefined,
            category: selectedCategory || undefined,
          })
        : null,
    false
  );

  React.useEffect(() => {
    if (storeId) {
      refetchProducts();
    }
  }, [storeId, searchText, selectedCategory]);

  const allProducts: Product[] = productsData?.products || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(allProducts.map((p) => p.category))];
    return cats;
  }, [allProducts]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchText) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return result;
  }, [allProducts, selectedCategory, searchText]);

  // Get cart item count
  const cartItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStore(), refetchProducts()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStore, refetchProducts]);

  const onAddToCart = (product: Product) => {
    // Check if different store
    if (cartStoreId && cartStoreId !== storeId) {
      Alert.alert(
        'Different Store',
        'You already have items from another store. Clear cart first?',
        [
          { text: 'Cancel' },
          {
            text: 'Clear & Add',
            onPress: () => {
              addItem(
                {
                  productId: product.id,
                  name: product.name,
                  price: product.sellingPrice,
                  quantity: addQuantity,
                  unit: product.unit,
                  imageUrl: product.imageUrl,
                  gstRate: product.gstRate,
                },
                storeId!
              );
              setShowAddModal(false);
            },
          },
        ]
      );
      return;
    }

    // Add to cart
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: addQuantity,
        unit: product.unit,
        imageUrl: product.imageUrl,
        gstRate: product.gstRate,
      },
      storeId!
    );

    setShowAddModal(false);
    Alert.alert('Success', `${product.name} added to cart!`);
  };

  const handleAddProduct = (product: Product) => {
    setSelectedProduct(product);
    setAddQuantity(1);
    setShowAddModal(true);
  };

  if (storeLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (storeError || !store) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="❌"
          title="Store Not Found"
          message={storeError?.message || 'Unable to load store details'}
        />
        <View style={styles.emptyActionContainer}>
          <Button
            label="Go Back"
            onPress={() => navigation.goBack()}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        {cartItemCount > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart' as never)}
            style={styles.cartBadge}
          >
            <Text style={styles.cartBadgeText}>🛒 {cartItemCount}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item: Product) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productGridWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Store Banner */}
            <View style={styles.storeBanner}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerIcon}>🏪</Text>
              </View>
            </View>

            {/* Store Info */}
            <Card style={styles.storeInfoCard}>
              <View style={styles.storeHeader}>
                <View>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeCity}>{store.city}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {store.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>({store.totalRatings})</Text>
                </View>
              </View>

              <View style={styles.storeDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Hours</Text>
                  <Text style={styles.detailValue}>
                    {store.openTime} - {store.closeTime}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Min Order</Text>
                  <Text style={styles.detailValue}>
                    ₹{store.minOrderValue}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Min</Text>
                  <Text style={styles.detailValue}>
                    {store.isOpen ? '✅ Open' : '❌ Closed'}
                  </Text>
                </View>
              </View>

              {!store.isOpen && (
                <View style={styles.closedAlert}>
                  <Text style={styles.closedAlertText}>Store is currently closed</Text>
                </View>
              )}
            </Card>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Input
                placeholder="Search products..."
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
              />
            </View>

            {/* Category Filter */}
            <View style={styles.categoriesContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      selectedCategory === (cat === 'All' ? null : cat) &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() =>
                      setSelectedCategory(
                        cat === 'All' ? null : cat
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === (cat === 'All' ? null : cat) &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Product Count */}
            {filteredProducts.length === 0 && !productsLoading && (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="📦"
                  title="No Products Found"
                  message="Try adjusting your search or category filters"
                />
              </View>
            )}

            {filteredProducts.length > 0 && (
              <Text style={styles.productCount}>
                {filteredProducts.length} products
              </Text>
            )}
          </>
        }
        renderItem={({ item: product }: { item: Product }) => (
          <Card style={styles.productCard}>
            {/* Product Image */}
            <View style={styles.productImageContainer}>
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Text style={styles.productImagePlaceholderText}>📦</Text>
                </View>
              )}
              {product.currentStock === 0 && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockBadgeText}>Out of Stock</Text>
                </View>
              )}
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.productSku}>{product.sku}</Text>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  ₹{product.sellingPrice.toFixed(2)}
                </Text>
                <Text style={styles.unit}>/ {product.unit}</Text>
              </View>

              {product.currentStock > 0 ? (
                <>
                  <Text style={styles.stock}>
                    ✅ {product.currentStock} in stock
                  </Text>
                  <Button
                    label="+ Add"
                    size="small"
                    onPress={() => handleAddProduct(product)}
                    fullWidth
                    disabled={!store.isOpen}
                  />
                </>
              ) : (
                <Button
                  label="Out of Stock"
                  size="small"
                  variant="secondary"
                  fullWidth
                  disabled
                  onPress={() => {}}
                />
              )}
            </View>
          </Card>
        )}
        ListFooterComponent={
          productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : null
        }
      />

      {/* Sticky Cart Button */}
      {cartItemCount > 0 && (
        <View style={styles.stickyCartContainer}>
          <Button
            label={`View Cart (${cartItemCount})`}
            onPress={() => navigation.navigate('Cart' as never)}
            fullWidth
          />
        </View>
      )}

      {/* Add to Cart Modal */}
      {showAddModal && selectedProduct && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalPrice}>
                ₹{selectedProduct.sellingPrice.toFixed(2)} / {selectedProduct.unit}
              </Text>

              <View style={styles.quantitySelector}>
                <Text style={styles.quantitySelectorLabel}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    onPress={() => setAddQuantity(Math.max(1, addQuantity - 1))}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{addQuantity}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setAddQuantity(
                        Math.min(selectedProduct.currentStock, addQuantity + 1)
                      )
                    }
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalTotal}>
                <Text style={styles.modalTotalLabel}>Total</Text>
                <Text style={styles.modalTotalValue}>
                  ₹{(selectedProduct.sellingPrice * addQuantity).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                label="Cancel"
                variant="secondary"
                size="small"
                onPress={() => setShowAddModal(false)}
                fullWidth
              />
              <View style={{ width: Spacing.sm }} />
              <Button
                label="Add to Cart"
                size="small"
                onPress={() => onAddToCart(selectedProduct)}
                fullWidth
              />
            </View>
          </Card>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  cartBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  cartBadgeText: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  storeBanner: {
    backgroundColor: Colors.secondary,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 48,
  },
  storeInfoCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  storeName: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  storeCity: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  ratingBadge: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  ratingCount: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
  },
  storeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  closedAlert: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  closedAlertText: {
    fontSize: Typography.body2.fontSize,
    color: Colors.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    borderRadius: 8,
  },
  categoriesContainer: {
    paddingVertical: Spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  productCount: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  productGridWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  productCard: {
    flex: 1,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 40,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  outOfStockBadgeText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.white,
    fontWeight: '600',
  },
  productInfo: {
    padding: Spacing.md,
  },
  productName: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  productSku: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  unit: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  stock: {
    fontSize: Typography.caption.fontSize,
    color: Colors.success,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  emptyContainer: {
    paddingVertical: Spacing.lg,
  },
  emptyActionContainer: {
    padding: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  stickyCartContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  modalCloseButton: {
    fontSize: Typography.h3.fontSize,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: Spacing.lg,
  },
  modalPrice: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  quantitySelector: {
    marginBottom: Spacing.lg,
  },
  quantitySelectorLabel: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityButtonText: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quantityValue: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  modalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
  },
  modalTotalLabel: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalTotalValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalFooter: {
    flexDirection: 'row',
  },
});
