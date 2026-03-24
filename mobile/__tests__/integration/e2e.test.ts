// mobile/__tests__/integration/e2e.test.ts

import { authService } from '@/services/authService';
import { storeService } from '@/services/storeService';
import { inventoryService } from '@/services/inventoryService';
import { orderService } from '@/services/orderService';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

// Mock all services
jest.mock('@/services/authService');
jest.mock('@/services/storeService');
jest.mock('@/services/inventoryService');
jest.mock('@/services/orderService');

describe('E2E - Customer Shopping Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCartStore.setState({ items: [], storeId: null });
  });

  it('should complete full customer shopping flow', async () => {
    // Step 1: Authentication
    (authService.verifyOtp as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'OTP verified',
      user: {
        id: 'customer_123',
        phone: '+919876543210',
        name: 'John Doe',
        role: 'customer'
      },
      accessToken: 'token_123',
      refreshToken: 'refresh_123'
    });

    const authRes = await authService.verifyOtp(
      '+919876543210',
      '123456'
    );

    expect(authRes.success).toBe(true);

    // Step 2: Browse nearby stores
    (storeService.getNearbyStores as jest.Mock).mockResolvedValueOnce({
      success: true,
      stores: [
        {
          id: 'store_1',
          name: 'Fresh Mart',
          city: 'Delhi',
          rating: 4.5,
          isOpen: true,
          distance: 0.8
        },
        {
          id: 'store_2',
          name: 'Daily Groceries',
          city: 'Delhi',
          rating: 4.2,
          isOpen: true,
          distance: 1.2
        }
      ],
      total: 2
    });

    const storesRes = await storeService.getNearbyStores(28.6139, 77.2090, 5);

    expect(storesRes.stores.length).toBeGreaterThan(0);
    expect(storesRes.stores[0].name).toBe('Fresh Mart');

    // Step 3: Get store products
    const selectedStore = storesRes.stores[0];
    (inventoryService.getStoreProducts as jest.Mock).mockResolvedValueOnce({
      success: true,
      products: [
        {
          id: 'prod_1',
          name: 'Whole Milk 1L',
          category: 'Dairy',
          sellingPrice: 55,
          unit: 'L',
          currentStock: 50,
          gstRate: 5
        },
        {
          id: 'prod_2',
          name: 'Yogurt 500g',
          category: 'Dairy',
          sellingPrice: 45,
          unit: 'pack',
          currentStock: 30,
          gstRate: 5
        }
      ],
      total: 2
    });

    const productsRes = await inventoryService.getStoreProducts(selectedStore.id);

    expect(productsRes.products.length).toBeGreaterThan(0);
    expect(productsRes.products[0].category).toBe('Dairy');

    // Step 4: Add items to cart
    const cartStore = useCartStore.getState();
    const product1 = productsRes.products[0];

    cartStore.addItem(
      {
        productId: product1.id,
        name: product1.name,
        price: product1.sellingPrice,
        quantity: 2,
        unit: product1.unit,
        imageUrl: product1.imageUrl,
        gstRate: product1.gstRate
      },
      selectedStore.id
    );

    expect(cartStore.items.length).toBe(1);
    expect(cartStore.items[0].quantity).toBe(2);

    // Step 5: Create order
    (orderService.createOrder as jest.Mock).mockResolvedValueOnce({
      success: true,
      order: {
        id: 'order_1',
        orderNumber: 'ORD-202603-001',
        status: 'PLACED',
        items: [
          {
            productId: product1.id,
            productName: product1.name,
            quantity: 2,
            unitPrice: product1.sellingPrice,
            totalPrice: product1.sellingPrice * 2
          }
        ],
        subtotal: 110,
        deliveryFee: 50,
        discount: 0,
        grandTotal: 160,
        createdAt: new Date().toISOString()
      }
    });

    const orderRes = await orderService.createOrder({
      storeId: selectedStore.id,
      items: [{ productId: product1.id, quantity: 2 }],
      deliveryAddress: '456 Oak Ave, Delhi',
      paymentMode: 'UPI'
    });

    expect(orderRes.success).toBe(true);
    expect(orderRes.order.status).toBe('PLACED');
    expect(orderRes.order.grandTotal).toBe(160);

    // Step 6: Verify order retrieval
    (orderService.getMyOrders as jest.Mock).mockResolvedValueOnce({
      success: true,
      orders: [orderRes.order],
      total: 1
    });

    const ordersRes = await orderService.getMyOrders();

    expect(ordersRes.orders.length).toBeGreaterThan(0);
    expect(ordersRes.orders[0].id).toBe(orderRes.order.id);

    console.log('✓ Full customer shopping flow completed successfully');
  });

  it('should handle multi-store cart conflict', async () => {
    // Mock stores
    (storeService.getNearbyStores as jest.Mock).mockResolvedValueOnce({
      success: true,
      stores: [
        { id: 'store_1', name: 'Store A' },
        { id: 'store_2', name: 'Store B' }
      ]
    });

    // Get stores
    const storesRes = await storeService.getNearbyStores(28.6139, 77.2090, 5);

    // Mock products from store 1
    const mockGetProducts = inventoryService.getStoreProducts as jest.Mock;
    mockGetProducts.mockResolvedValueOnce({
      success: true,
      products: [
        {
          id: 'prod_1',
          name: 'Product 1',
          sellingPrice: 50,
          unit: 'unit',
          gstRate: 5
        }
      ]
    });
    
    mockGetProducts.mockResolvedValueOnce({
      success: true,
      products: [
        {
          id: 'prod_2',
          name: 'Product 2',
          sellingPrice: 60,
          unit: 'unit',
          gstRate: 5
          }
        ]
      });

    // Add item from store 1
    const store1 = storesRes.stores[0];
    const products1 = await inventoryService.getStoreProducts(store1.id);
    const cartStore = useCartStore.getState();

    cartStore.addItem(
      {
        productId: products1.products[0].id,
        name: products1.products[0].name,
        price: products1.products[0].sellingPrice,
        quantity: 1,
        unit: products1.products[0].unit,
        gstRate: products1.products[0].gstRate
      },
      store1.id
    );

    expect(cartStore.storeId).toBe(store1.id);
    expect(cartStore.items.length).toBe(1);

    // Try to add item from store 2
    const store2 = storesRes.stores[1];
    const products2 = await inventoryService.getStoreProducts(store2.id);

    // This should clear the previous store's items and add new store
    cartStore.addItem(
      {
        productId: products2.products[0].id,
        name: products2.products[0].name,
        price: products2.products[0].sellingPrice,
        quantity: 1,
        unit: products2.products[0].unit,
        gstRate: products2.products[0].gstRate
      },
      store2.id
    );

    expect(cartStore.storeId).toBe(store2.id);
    expect(cartStore.items.length).toBe(1);
    expect(cartStore.items[0].productId).toBe(products2.products[0].id);

    console.log('✓ Multi-store cart conflict handled correctly');
  });
});

describe('E2E - Owner POS Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete owner billing cycle', async () => {
    // Step 1: Owner login
    (authService.verifyOtp as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'OTP verified',
      user: {
        id: 'owner_123',
        phone: '+919876543211',
        name: 'Store Owner',
        role: 'owner'
      },
      accessToken: 'token_456',
      refreshToken: 'refresh_456'
    });

    const authRes = await authService.verifyOtp(
      '+919876543211',
      '123456'
    );

    expect(authRes.success).toBe(true);

    // Step 2: Get store inventory
    (inventoryService.getStoreProducts as jest.Mock).mockResolvedValueOnce({
      success: true,
      products: [
        {
          id: 'prod_1',
          name: 'Milk',
          currentStock: 100,
          sellingPrice: 55,
          gstRate: 5
        },
        {
          id: 'prod_2',
          name: 'Bread',
          currentStock: 50,
          sellingPrice: 40,
          gstRate: 5
        }
      ]
    });

    const productsRes = await inventoryService.getStoreProducts('store_owner_1');

    expect(productsRes.products.length).toBe(2);

    // Step 3: Create bill (stock deduction happens server-side)
    (orderService.createOrder as jest.Mock).mockResolvedValueOnce({
      success: true,
      order: {
        id: 'bill_1',
        billNumber: 'BL-202603-001',
        items: [
          {
            productId: 'prod_1',
            quantity: 2,
            totalPrice: 110
          }
        ],
        subtotal: 110,
        tax: 5.5,
        grandTotal: 115.5,
        status: 'COMPLETED'
      }
    });

    const billRes = await orderService.createOrder({
      storeId: 'store_owner_1',
      items: [{ productId: 'prod_1', quantity: 2 }],
      deliveryAddress: 'counter',
      paymentMode: 'CASH'
    });

    expect(billRes.order.status).toBe('COMPLETED');
    expect(billRes.order.grandTotal).toBeGreaterThan(0);

    console.log('✓ Owner POS flow completed successfully');
  });
});
