// mobile/__tests__/store/cartStore.test.ts

import { useCartStore } from '@/store/cartStore';

describe('Cart Store Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCartStore.setState({ items: [], storeId: null });
  });

  describe('addItem', () => {
    it('should add item to cart', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      expect(store.items.length).toBe(1);
      expect(store.storeId).toBe('store_1');
      expect(store.items[0].productId).toBe('prod_1');
      expect(store.items[0].quantity).toBe(2);
    });

    it('should increment quantity if product already in cart', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 1,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      expect(store.items.length).toBe(1);
      expect(store.items[0].quantity).toBe(3);
    });

    it('should clear cart when adding from different store', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      expect(store.items.length).toBe(1);

      // Add from different store
      store.addItem(
        {
          productId: 'prod_2',
          name: 'Bread',
          price: 40,
          quantity: 1,
          unit: 'pack',
          gstRate: 5
        },
        'store_2'
      );

      expect(store.storeId).toBe('store_2');
      expect(store.items.length).toBe(1);
      expect(store.items[0].productId).toBe('prod_2');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      store.removeItem('prod_1');

      expect(store.items.length).toBe(0);
    });

    it('should not affect other items', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      store.addItem(
        {
          productId: 'prod_2',
          name: 'Bread',
          price: 40,
          quantity: 1,
          unit: 'pack',
          gstRate: 5
        },
        'store_1'
      );

      store.removeItem('prod_1');

      expect(store.items.length).toBe(1);
      expect(store.items[0].productId).toBe('prod_2');
    });
  });

  describe('updateQty', () => {
    it('should update item quantity', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      store.updateQty('prod_1', 5);

      expect(store.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity <= 0', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      store.updateQty('prod_1', 0);

      expect(store.items.length).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items and reset store', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      store.clearCart();

      expect(store.items.length).toBe(0);
      expect(store.storeId).toBeNull();
    });
  });

  describe('total', () => {
    it('should calculate total price correctly', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      store.addItem(
        {
          productId: 'prod_2',
          name: 'Bread',
          price: 40,
          quantity: 1,
          unit: 'pack',
          gstRate: 5
        },
        'store_1'
      );

      const expectedTotal = 55 * 2 + 40 * 1; // 110 + 40 = 150
      expect(store.total()).toBe(expectedTotal);
    });
  });

  describe('itemCount', () => {
    it('should calculate total item count', () => {
      const store = useCartStore.getState();

      store.addItem(
        {
          productId: 'prod_1',
          name: 'Milk',
          price: 55,
          quantity: 2,
          unit: 'L',
          gstRate: 5
        },
        'store_1'
      );

      store.addItem(
        {
          productId: 'prod_2',
          name: 'Bread',
          price: 40,
          quantity: 3,
          unit: 'pack',
          gstRate: 5
        },
        'store_1'
      );

      expect(store.itemCount()).toBe(5); // 2 + 3
    });
  });
});
