import { create } from "zustand";
import { getAccount, getToken, setToken } from "../api/client";

export const useAuthStore = create((set) => ({
  token: getToken(),
  user: null,
  ready: false,

  setSession: (token, user) => {
    setToken(token);
    set({ token, user });
  },
  logout: () => {
    setToken(null);
    set({ token: null, user: null });
  },
  hydrate: async () => {
    const token = getToken();
    if (!token) {
      set({ ready: true, token: null, user: null });
      return;
    }
    try {
      const user = await getAccount();
      set({ token, user, ready: true });
    } catch (err) {
      if (err.status === 401) {
        setToken(null);
        set({ token: null, user: null, ready: true });
        return;
      }
      set({ ready: true });
    }
  },
}));
