import { create } from "zustand";
import { addCartLine, deleteCartLine, getCart, patchCartLine, setCartId } from "../api/client";

function applyCart(set, data) {
  if (data?.id) setCartId(data.id);
  set({
    lines: data?.lines || [],
    ready: true,
  });
}

export const useCartStore = create((set, get) => ({
  lines: [],
  ready: false,

  hydrate: async () => {
    try {
      const data = await getCart();
      applyCart(set, data);
    } catch {
      set({ ready: true });
    }
  },

  addLine: async ({ variantId, qty = 1 }) => {
    const data = await addCartLine(variantId, qty);
    applyCart(set, data);
  },

  setQty: async (id, qty) => {
    const data = qty < 1 ? await deleteCartLine(id) : await patchCartLine(id, qty);
    applyCart(set, data);
  },

  removeLine: async (id) => {
    const data = await deleteCartLine(id);
    applyCart(set, data);
  },

  hydrateFrom: (data) => applyCart(set, data),
  clear: () => {
    setCartId(null);
    set({ lines: [], ready: true });
  },

  count: () => get().lines.reduce((sum, line) => sum + line.qty, 0),
  subtotal: () => get().lines.reduce((sum, line) => sum + Number(line.price) * line.qty, 0),
}));
