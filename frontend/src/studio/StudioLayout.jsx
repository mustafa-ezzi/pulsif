import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";

export function StudioLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(location.pathname.endsWith("/login"));
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

  if (!ready) {
    return <div className="studio-boot">Loading studio…</div>;
  }

  if (!isLogin && !token) {
    return <Navigate to="/studio/login" replace state={{ from: location }} />;
  }

  if (isLogin) {
    return <Outlet />;
  }

  return (
    <div className="studio">
      <header className="studio-bar">
        <Link to="/studio" className="site-logo">
          Pulsif Studio
        </Link>
        <nav>
          <NavLink to="/studio" end>
            Dashboard
          </NavLink>
          <NavLink to="/studio/products">Products</NavLink>
          <NavLink to="/studio/orders">Orders</NavLink>
          <NavLink to="/studio/carousels">Carousels</NavLink>
          <NavLink to="/studio/settings">Settings</NavLink>
          <Link to="/">View store</Link>
        </nav>
        <div className="studio-bar__user">
          <span>{user?.username || "staff"}</span>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              logout();
              navigate("/studio/login");
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
