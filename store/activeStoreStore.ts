import { create } from 'zustand';
import { Store } from '@/types/store.types';

interface ActiveStoreState {
  activeStore: Store | null;
  stores: Store[];
  setActiveStore: (store: Store) => void;
  setStores: (stores: Store[]) => void;
  addStore: (store: Store) => void;
  updateStore: (store: Store) => void;
  deleteStore: (storeId: string) => void;
  clear: () => void;
}

export const useActiveStoreStore = create<ActiveStoreState>((set) => ({
  activeStore: null,
  stores: [],
  setActiveStore: (store) => set({ activeStore: store }),
  setStores: (stores) => set({ stores }),
  addStore: (store) =>
    set((state) => ({
      stores: [...state.stores, store],
      activeStore: state.activeStore || store,
    })),
  updateStore: (store) =>
    set((state) => ({
      stores: state.stores.map((s) => (s.id === store.id ? store : s)),
      activeStore: state.activeStore?.id === store.id ? store : state.activeStore,
    })),
  deleteStore: (storeId) =>
    set((state) => {
      const filtered = state.stores.filter((s) => s.id !== storeId);
      return {
        stores: filtered,
        activeStore:
          state.activeStore?.id === storeId
            ? filtered[0] || null
            : state.activeStore,
      };
    }),
  clear: () => set({ activeStore: null, stores: [] }),
}));
