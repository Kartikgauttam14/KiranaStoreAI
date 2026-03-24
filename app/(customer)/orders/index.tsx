import React, { useState } from 'react';
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
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { useAsync } from '@/hooks/useAsync';
import { orderService } from '@/services/orderService';
import { storeService } from '@/services/storeService';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { Order, OrderStatus } from '@/types/order.types';
import { Store } from '@/types/store.types';

interface RouteParams {
  orderId?: string;
}

const ORDER_STATUS_STEPS: OrderStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: '📋 Order Placed',
  CONFIRMED: '✅ Confirmed',
  PACKED: '📦 Packed',
  OUT_FOR_DELIVERY: '🚚 Out for Delivery',
  DELIVERED: '🎉 Delivered',
  CANCELLED: '❌ Cancelled',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PLACED: Colors.primary,
  CONFIRMED: Colors.primary,
  PACKED: Colors.warning,
  OUT_FOR_DELIVERY: Colors.warning,
  DELIVERED: Colors.success,
  CANCELLED: Colors.error,
};

export default function OrdersScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId: selectedOrderId } = (route.params as RouteParams) || {};

  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderId_State, setSelectedOrderId_State] = useState<
    string | null
  >(selectedOrderId || null);

  // Fetch customer orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    execute: refetchOrders,
  } = useAsync(async () => await orderService.getMyOrders(), false);

  React.useEffect(() => {
    refetchOrders();
  }, []);

  const allOrders: Order[] = ordersData?.orders || [];

  // Fetch selected order details
  const {
    data: selectedOrderData,
    isLoading: selectedOrderLoading,
    error: selectedOrderError,
    execute: refetchSelectedOrder,
  } = useAsync(
    async () =>
      selectedOrderId_State
        ? (await orderService.getMyOrders()).orders.find((o) => o.id === selectedOrderId_State)
        : null,
    false
  );

  React.useEffect(() => {
    if (selectedOrderId_State) {
      refetchSelectedOrder();
    }
  }, [selectedOrderId_State]);

  const selectedOrder: Order | null = selectedOrderId_State
    ? (selectedOrderData as Order | null)
    : null;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchOrders();
    } finally {
      setRefreshing(false);
    }
  }, [refetchOrders]);

  const getStatusIndex = (status: OrderStatus): number => {
    if (status === 'CANCELLED') return -1;
    return ORDER_STATUS_STEPS.indexOf(status);
  };

  const getEstimatedDeliveryTime = (order: Order): string => {
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (order.status === 'DELIVERED') return 'Delivered';
    if (order.status === 'CANCELLED') return 'Cancelled';

    const estimatedHours = 4 - Math.min(diffHours, 3);
    if (estimatedHours <= 0) return 'Arriving soon...';
    return `~${estimatedHours} hour${estimatedHours > 1 ? 's' : ''}`;
  };

  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'Cancel' },
        {
          text: 'Yes, Cancel Order',
          onPress: async () => {
            try {
              await orderService.cancelOrder(order.id);
              await refetchOrders();
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel order');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleContactStore = async (storeId: string) => {
    try {
      const storeRes = await storeService.getStore(storeId);
      const store = storeRes.store;
      if (store.phone) {
        Linking.openURL(`tel:${store.phone}`);
      } else {
        Alert.alert('Contact', 'Store phone number not available');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not retrieve store contact');
    }
  };

  // Show selected order detail view
  if (selectedOrder) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedOrderId_State(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Order Header */}
          <Card style={styles.orderHeaderCard}>
            <View style={styles.orderHeaderRow}>
              <View>
                <Text style={styles.orderNumber}>
                  Order #{selectedOrder.orderNumber}
                </Text>
                <Text style={styles.orderDate}>
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      STATUS_COLORS[selectedOrder.status] + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: STATUS_COLORS[selectedOrder.status] },
                  ]}
                >
                  {STATUS_LABELS[selectedOrder.status]}
                </Text>
              </View>
            </View>

            {/* Delivery Time */}
            <View style={styles.estimatedDeliveryContainer}>
              <Text style={styles.estimatedDeliveryLabel}>Estimated Delivery</Text>
              <Text style={styles.estimatedDeliveryTime}>
                {getEstimatedDeliveryTime(selectedOrder)}
              </Text>
            </View>
          </Card>

          {/* Order Status Timeline */}
          {selectedOrder.status !== 'CANCELLED' && (
            <Card style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>📍 Tracking</Text>
              <View style={styles.timeline}>
                {ORDER_STATUS_STEPS.map((step, index) => {
                  const currentIndex = getStatusIndex(selectedOrder.status);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <View key={step} style={styles.timelineStep}>
                      {/* Timeline dot and line */}
                      <View style={styles.timelineDotContainer}>
                        <View
                          style={[
                            styles.timelineDot,
                            isCompleted && {
                              backgroundColor: STATUS_COLORS[step],
                            },
                          ]}
                        >
                          {isCompleted && (
                            <Text style={styles.timelineDotCheck}>✓</Text>
                          )}
                        </View>
                        {index < ORDER_STATUS_STEPS.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              isCompleted && {
                                backgroundColor: STATUS_COLORS[step],
                              },
                            ]}
                          />
                        )}
                      </View>

                      {/* Status label */}
                      <View style={styles.timelineContent}>
                        <Text
                          style={[
                            styles.timelineLabel,
                            isCompleted && styles.timelineLabelActive,
                          ]}
                        >
                          {STATUS_LABELS[step]}
                        </Text>
                        <Text style={styles.timelineTime}>
                          {isCompleted ? '✓ Completed' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Order Items */}
          <Card style={styles.itemsCard}>
            <Text style={styles.sectionTitle}>📦 Items</Text>
            {selectedOrder.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemQuantity}>
                    Qty: {item.quantity} {item.unit}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  ₹{item.totalPrice.toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₹{selectedOrder.subtotal.toFixed(2)}
              </Text>
            </View>
            {selectedOrder.deliveryFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  ₹{selectedOrder.deliveryFee.toFixed(2)}
                </Text>
              </View>
            )}
            {selectedOrder.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>
                  -₹{selectedOrder.discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ₹{selectedOrder.grandTotal.toFixed(2)}
              </Text>
            </View>
          </Card>

          {/* Delivery Info */}
          <Card style={styles.deliveryCard}>
            <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
            <Text style={styles.deliveryAddress}>
              {selectedOrder.deliveryAddress}
            </Text>
          </Card>

          {/* Payment Info */}
          <Card style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <Text style={styles.paymentValue}>
                {selectedOrder.paymentMode}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <Text
                style={[
                  styles.paymentValue,
                  {
                    color: selectedOrder.isPaid ? Colors.success : Colors.error,
                  },
                ]}
              >
                {selectedOrder.isPaid ? '✓ Paid' : '⏳ Pending'}
              </Text>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {selectedOrder.status !== 'DELIVERED' &&
              selectedOrder.status !== 'CANCELLED' && (
                <Button
                  label="Cancel Order"
                  variant="secondary"
                  onPress={() => handleCancelOrder(selectedOrder)}
                  fullWidth
                />
              )}
            <View style={{ height: Spacing.sm }} />
            <Button
              label="Contact Store"
              onPress={() => handleContactStore(selectedOrder.storeId)}
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show orders list
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 My Orders</Text>
      </View>

      <FlatList
        data={allOrders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item: order }) => (
          <TouchableOpacity
            onPress={() => setSelectedOrderId_State(order.id)}
            activeOpacity={0.7}
          >
            <Card style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={styles.orderNumber}>
                    Order #{order.orderNumber}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[order.status] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: STATUS_COLORS[order.status] },
                    ]}
                  >
                    {STATUS_LABELS[order.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.orderCardContent}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.itemCountLabel}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.itemListPreview}>
                    {order.items
                      .map((item) => item.productName)
                      .slice(0, 2)
                      .join(', ')}
                    {order.items.length > 2 ? '...' : ''}
                  </Text>
                </View>

                <View style={styles.orderAmount}>
                  <Text style={styles.totalAmountLabel}>Total</Text>
                  <Text style={styles.totalAmount}>
                    ₹{order.grandTotal.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Delivery ETA */}
              {order.status !== 'DELIVERED' &&
                order.status !== 'CANCELLED' && (
                  <View style={styles.etaContainer}>
                    <Text style={styles.etaText}>
                      🕐 {getEstimatedDeliveryTime(order)}
                    </Text>
                  </View>
                )}
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          ordersLoading ? (
            <LoadingSpinner />
          ) : (
            <EmptyState
              icon="📦"
              title="No Orders Yet"
              message="Start shopping to place your first order"
            />
          )
        }
        contentContainerStyle={
          allOrders.length === 0 && !ordersLoading
            ? { flexGrow: 1 }
            : { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md }
        }
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  backButton: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  orderCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderNumber: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  orderDate: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
  },
  orderCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderItemInfo: {
    flex: 1,
  },
  itemCountLabel: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemListPreview: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  totalAmountLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  totalAmount: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  etaContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
  },
  etaText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.warning,
    textAlign: 'center',
  },
  // Detail view styles
  orderHeaderCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  estimatedDeliveryContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  estimatedDeliveryLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  estimatedDeliveryTime: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  timelineCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  timeline: {
    marginLeft: Spacing.md,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  timelineDotContainer: {
    alignItems: 'center',
    marginRight: Spacing.md,
    width: 30,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  timelineDotCheck: {
    fontSize: Typography.body2.fontSize,
    color: Colors.white,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
    marginTop: Spacing.sm,
  },
  timelineContent: {
    flex: 1,
    paddingTop: Spacing.xs,
  },
  timelineLabel: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timelineLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  timelineTime: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  itemsCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemQuantity: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  itemPrice: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  deliveryCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  deliveryAddress: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  paymentCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  paymentLabel: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  paymentValue: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionsContainer: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
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
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
});
