import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { BackButton } from "../components/ui/BackButton";

export function StudioLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(location.pathname.endsWith("/login"));
  const [menuOpen, setMenuOpen] = useState(false);
  usePageTitle("Studio");

  const isLogin = location.pathname === "/studio/login";

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return undefined;
    }
    if (!token) {
      setReady(true);
      return undefined;
    }
    let cancelled = false;
    api("/auth/me/")
      .then((data) => {
        if (!cancelled) {
          setSession(token, data);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          logout();
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLogin, token, setSession, logout]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!ready) {
    return <div className="studio-boot">Loading studio…</div>;
  }

  if (!isLogin && !token) {
    return <Navigate to="/studio/login" replace state={{ from: location }} />;
  }

  if (isLogin) {
    return <Outlet />;
  }

  const signOut = () => {
    logout();
    navigate("/studio/login");
  };

  return (
    <div className={menuOpen ? "studio is-menu" : "studio"}>
      <header className="studio-bar">
        <div className="studio-bar__brand">
          <button
            className="studio-bar__menu"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
          <BackButton />
          <Link to="/studio" className="site-logo">
            Pulsif Studio
          </Link>
        </div>
        <nav className={menuOpen ? "is-open" : undefined}>
          <NavLink to="/studio" end>
            Dashboard
          </NavLink>
          <NavLink to="/studio/products">Products</NavLink>
          <NavLink to="/studio/orders">Orders</NavLink>
          <NavLink to="/studio/carousels">Carousels</NavLink>
          <NavLink to="/studio/settings">Settings</NavLink>
          <Link to="/">View store</Link>
          <span className="studio-bar__who">{user?.username || "staff"}</span>
          <button
            type="button"
            className="studio-bar__signout"
            onClick={signOut}
          >
            Log out
          </button>
        </nav>
        <div className="studio-bar__user">
          <span>{user?.username || "staff"}</span>
          <button type="button" className="text-link" onClick={signOut}>
            Log out
          </button>
        </div>
      </header>
      {menuOpen ? (
        <button className="studio-bar__shade" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
      ) : null}
      <Outlet />
    </div>
  );
}
