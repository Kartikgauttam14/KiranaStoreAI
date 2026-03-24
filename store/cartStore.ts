import { create } from 'zustand';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  gstRate: number;
}

interface CartState {
  items: CartItem[];
  storeId: string | null;
  addItem: (item: CartItem, storeId: string) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
  setStoreId: (storeId: string) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  storeId: null,
  addItem: (item, storeId) =>
    set((state) => {
      if (state.storeId && state.storeId !== storeId) {
        return { items: [item], storeId };
      }
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          ),
          storeId,
        };
      }
      return { items: [...state.items, item], storeId };
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== id),
    })),
  updateQty: (id, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.productId !== id)
          : state.items.map((i) =>
              i.productId === id ? { ...i, quantity: qty } : i
            ),
    })),
  clearCart: () => set({ items: [], storeId: null }),
  total: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
  setStoreId: (storeId) => set({ storeId }),
}));
