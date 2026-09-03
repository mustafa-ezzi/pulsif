import { create } from "zustand";

const envLenis = import.meta.env.VITE_LENIS === "true";

export const useLabStore = create((set) => ({
  lenisEnabled: envLenis,
  heroMode: "pin-snap",
  forceReducedMotion: false,
  showMarkers: false,
  cartOpen: false,
  searchOpen: false,
  setLenisEnabled: (lenisEnabled) => set({ lenisEnabled }),
  setHeroMode: (heroMode) => set({ heroMode }),
  setForceReducedMotion: (forceReducedMotion) => set({ forceReducedMotion }),
  setShowMarkers: (showMarkers) => set({ showMarkers }),
  setCartOpen: (cartOpen) =>
    set((state) => ({ cartOpen, searchOpen: cartOpen ? false : state.searchOpen })),
  setSearchOpen: (searchOpen) =>
    set((state) => ({ searchOpen, cartOpen: searchOpen ? false : state.cartOpen })),
  closeDrawers: () => set({ cartOpen: false, searchOpen: false }),
}));
