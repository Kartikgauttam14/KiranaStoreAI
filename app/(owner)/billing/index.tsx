import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useActiveStoreStore } from '@/store/activeStoreStore';
import { useCartStore } from '@/store/cartStore';
import { useAsync } from '@/hooks/useAsync';
import { inventoryService } from '@/services/inventoryService';
import { billingService } from '@/services/billingService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { Product } from '@/types/inventory.types';
import { formatCurrency } from '@/utils/formatCurrency';

const PAYMENT_MODES = ['CASH', 'UPI', 'CARD', 'CREDIT'] as const;

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  gstRate: number;
}

export default function BillingScreen() {
  const activeStore = useActiveStoreStore((state) => state.activeStore);
  const navigation = useNavigation();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<typeof PAYMENT_MODES[number]>('CASH');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch products
  const {
    data: productsData,
    loading: productsLoading,
  } = useAsync(
    () =>
      activeStore
        ? inventoryService.getStoreProducts(activeStore.id, { search: searchText })
        : null,
    { initialData: null }
  );

  const filteredProducts = useMemo(() => {
    const products = productsData?.products || [];
    if (!searchText) return products.slice(0, 10); // Show first 10 products
    return products.filter((p: Product) => p.currentStock > 0);
  }, [productsData, searchText]);

  // Calculate totals
  const { subtotal, totalGST, total } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalGST = cartItems.reduce((sum, item) => {
      const gstAmount = (item.price * item.quantity * item.gstRate) / 100;
      return sum + gstAmount;
    }, 0);
    const discountAmount = (subtotal + totalGST) * (discount / 100);
    const total = subtotal + totalGST - discountAmount;
    return { subtotal, totalGST: +totalGST.toFixed(2), total: +total.toFixed(2) };
  }, [cartItems, discount]);

  const onAddToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.productId === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
          unit: product.unit,
          gstRate: product.gstRate,
        },
      ]);
    }
    setSearchText('');
  };

  const onUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveFromCart(productId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const onRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const onCreateBill = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items to the cart before creating a bill');
      return;
    }

    if (!activeStore) return;

    // Validate payment mode
    if (!['CASH', 'UPI', 'CARD', 'CREDIT'].includes(selectedPaymentMode)) {
      Alert.alert('Invalid Payment', 'Please select a valid payment mode');
      return;
    }

    setIsProcessing(true);
    try {
      const billData = {
        storeId: activeStore.id,
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || undefined,
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.price,
          gstRate: item.gstRate,
        })),
        paymentMode: selectedPaymentMode as 'CASH' | 'UPI' | 'CARD' | 'CREDIT',
        discount,
      };

      const response = await billingService.createBill(billData);

      if (response.success) {
        // Navigate to bill preview
        navigation.navigate('BillDetail', { billId: response.data.id });

        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setCartItems([]);
        setDiscount(0);
        setSelectedPaymentMode('CASH');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create bill');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!activeStore) {
    return (
      <EmptyState
        icon="🏪"
        title="No Store Selected"
        message="Please select a store to create a bill"
      />
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth > 800;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧾 New Bill</Text>
      </View>

      <View style={isTablet ? styles.contentTablet : styles.contentMobile}>
        {/* Left Panel: Product Search */}
        <View style={isTablet ? styles.panelLeft : undefined}>
          <View style={styles.searchSection}>
            <Input
              placeholder="Search products..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
          </View>

          {productsLoading ? (
            <LoadingSpinner />
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              scrollEnabled={isTablet}
              nestedScrollEnabled={isTablet}
              renderItem={({ item: product }) => (
                <TouchableOpacity
                  style={styles.productItem}
                  onPress={() => onAddToCart(product)}
                  disabled={product.currentStock === 0}
                >
                  <Card style={styles.productCard}>
                    <View>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>₹{product.sellingPrice}</Text>
                      <Text
                        style={[
                          styles.productStock,
                          product.currentStock === 0 && { color: Colors.danger },
                        ]}
                      >
                        {product.currentStock > 0 ? `Stock: ${product.currentStock}` : 'Out of Stock'}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.productsList}
            />
          )}
        </View>

        {/* Right Panel: Cart & Checkout */}
        <View style={isTablet ? styles.panelRight : undefined}>
          {/* Customer Info */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Info</Text>
            <Input
              placeholder="Name (optional)"
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.input}
            />
            <Input
              placeholder="Phone (optional)"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Card>

          {/* Cart Items */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>
              Cart {cartItems.length > 0 && `(${cartItems.length})`}
            </Text>

            {cartItems.length === 0 ? (
              <Text style={styles.emptyCartText}>No items in cart</Text>
            ) : (
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.productId}
                scrollEnabled={false}
                nestedScrollEnabled
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>₹{item.price} x {item.quantity}</Text>
                    </View>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => onRemoveFromCart(item.productId)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </Card>

          {/* Discount */}
          {cartItems.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Discount (%)</Text>
              <Input
                placeholder="0"
                value={discount.toString()}
                onChangeText={(text) => setDiscount(parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </Card>
          )}

          {/* Payment Mode */}
          {cartItems.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Mode</Text>
              <View style={styles.paymentModes}>
                {PAYMENT_MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.paymentModeButton,
                      selectedPaymentMode === mode && styles.paymentModeButtonActive,
                    ]}
                    onPress={() => setSelectedPaymentMode(mode)}
                  >
                    <Text
                      style={[
                        styles.paymentModeText,
                        selectedPaymentMode === mode && styles.paymentModeTextActive,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Total Summary */}
          {cartItems.length > 0 && (
            <Card style={[styles.section, styles.summaryCard]}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GST:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalGST)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount ({discount}%):</Text>
                  <Text style={styles.summaryValue}>
                    -{formatCurrency((subtotal + totalGST) * (discount / 100))}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>

              <Button
                label={isProcessing ? 'Processing...' : 'Generate Bill'}
                onPress={onCreateBill}
                disabled={isProcessing || cartItems.length === 0}
                fullWidth
              />
            </Card>
          )}
        </View>
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
  contentMobile: {
    flex: 1,
    flexDirection: 'column',
  },
  contentTablet: {
    flex: 1,
    flexDirection: 'row',
  },
  panelLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  panelRight: {
    flex: 1,
  },
  searchSection: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    fontSize: Typography.body2.fontSize,
  },
  productsList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  productItem: {
    marginBottom: Spacing.sm,
  },
  productCard: {
    padding: Spacing.md,
  },
  productName: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  productPrice: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  productStock: {
    fontSize: Typography.caption.fontSize,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  section: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
  },
  emptyCartText: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  cartItemName: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cartItemPrice: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    gap: Spacing.xs,
  },
  quantityButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  quantityButtonText: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  quantityText: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    minWidth: 25,
    textAlign: 'center',
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: Typography.body1.fontSize,
  },
  paymentModes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  paymentModeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 4,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  paymentModeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paymentModeText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paymentModeTextActive: {
    color: Colors.white,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    marginTopVertical: Spacing.sm,
    paddingTop: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
});
