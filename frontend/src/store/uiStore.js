import { create } from "zustand";

export const useUiStore = create((set) => ({
  cartOpen: false,
  searchOpen: false,
  navOpen: false,
  openCart: () => set({ cartOpen: true, searchOpen: false, navOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false, navOpen: false }),
  openNav: () => set({ navOpen: true, cartOpen: false, searchOpen: false }),
  closeAll: () => set({ cartOpen: false, searchOpen: false, navOpen: false }),
}));
