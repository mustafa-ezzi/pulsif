import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { CartDrawer } from "./CartDrawer";
import { SearchDrawer } from "./SearchDrawer";
import { NavDrawer } from "./NavDrawer";

export function AppShell() {
  const location = useLocation();
  const hydrate = useCartStore((state) => state.hydrate);
  const hydrateAuth = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    useUiStore.getState().closeAll();
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    hydrate();
    hydrateAuth();
  }, [hydrate, hydrateAuth]);

  return (
    <div className="site">
      <SiteHeader />
      <main className="site-main">
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
      <SearchDrawer />
      <NavDrawer />
    </div>
  );
}
