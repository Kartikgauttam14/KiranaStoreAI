import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useCartStore } from '@/store/cartStore';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatCurrency';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export default function CartScreen() {
  const navigation = useNavigation();
  const cartItems = useCartStore((state) => state.items);
  const storeId = useCartStore((state) => state.storeId);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQty = useCartStore((state) => state.updateQty);
  const clearCart = useCartStore((state) => state.clearCart);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const onRefocus = () => {
    // Refresh cart data if needed
  };

  useFocusEffect(
    React.useCallback(() => {
      onRefocus();
    }, [])
  );

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const onApplyPromo = () => {
    // Mock promo validation
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(10);
      Alert.alert('Success', 'Promo code applied: 10% off');
    } else if (promoCode.toUpperCase() === 'WELCOME5') {
      setDiscount(5);
      Alert.alert('Success', 'Promo code applied: 5% off');
    } else {
      Alert.alert('Invalid', 'Promo code not found');
    }
  };

  const onCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items before checkout');
      return;
    }

    setIsProcessing(true);
    try {
      // Navigate to checkout/payment screen
      navigation.navigate('Checkout', { cartItems, storeId, total });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🛒 Shopping Cart</Text>
        </View>

        <EmptyState
          icon="🛒"
          title="Your Cart is Empty"
          message="Add some products from nearby stores to get started"
        />

        <View style={styles.emptyActionContainer}>
          <Button
            label="Browse Stores"
            onPress={() => navigation.navigate('Stores' as never)}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Shopping Cart</Text>
        <Button
          label="Clear"
          onPress={() => {
            Alert.alert('Clear Cart', 'Remove all items?', [
              { text: 'Cancel' },
              { text: 'Clear', onPress: clearCart },
            ]);
          }}
          size="small"
          variant="ghost"
        />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Items ({cartItems.length})
          </Text>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.productId}
            scrollEnabled={false}
            nestedScrollEnabled
            renderItem={({ item }) => (
              <Card style={styles.cartItemCard}>
                <View style={styles.cartItemContent}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      ₹{item.price.toFixed(2)} × {item.quantity}
                    </Text>
                    <Text style={styles.itemTotal}>
                      = ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      onPress={() =>
                        updateQty(item.productId, item.quantity - 1)
                      }
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateQty(item.productId, item.quantity + 1)
                      }
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeItem(item.productId)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
          />
        </View>

        {/* Delivery Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
          <Button
            label="+ Add Address"
            onPress={() => navigation.navigate('Addresses' as never)}
            fullWidth
            size="small"
            variant="secondary"
          />
        </Card>

        {/* Promo Code */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🎉 Promo Code</Text>
          <View style={styles.promoContainer}>
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              style={styles.promoButton}
              onPress={onApplyPromo}
            >
              <Text style={styles.promoButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.promoHint}>
            Try: SAVE10 or WELCOME5
          </Text>
        </Card>

        {/* Order Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>📋 Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(subtotal)}
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({discount}%)</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                -{formatCurrency(discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <Button
          label={isProcessing ? 'Processing...' : 'Proceed to Checkout'}
          onPress={onCheckout}
          disabled={isProcessing || cartItems.length === 0}
          fullWidth
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
  cartItemCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cartItemContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemPrice: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  itemTotal: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  quantityButton: {
    paddingHorizontal: Spacing.sm,
  },
  quantityButtonText: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  quantityValue: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: Typography.body1.fontSize,
  },
  promoContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  promoButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 4,
    justifyContent: 'center',
  },
  promoButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: Typography.caption.fontSize,
  },
  promoHint: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  summaryCard: {
    margin: Spacing.md,
    padding: Spacing.md,
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
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
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
  checkoutContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  emptyActionContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
