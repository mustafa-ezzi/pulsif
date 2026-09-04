import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function fallbackPath(pathname) {
  if (pathname.startsWith("/studio")) {
    if (/^\/studio\/products\/[^/]+/.test(pathname)) return "/studio/products";
    if (/^\/studio\/orders\/[^/]+/.test(pathname)) return "/studio/orders";
    if (pathname === "/studio") return "/";
    return "/studio";
  }
  if (pathname.startsWith("/product/")) return "/catalog";
  if (pathname === "/checkout") return "/cart";
  if (pathname === "/cart") return "/catalog";
  if (pathname.startsWith("/order/")) return "/account";
  return "/";
}

export function BackButton({ className = "" }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === "/studio/login") return null;

  const idx = window.history.state?.idx ?? 0;
  if (pathname === "/" && idx < 1) return null;

  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }
    navigate(fallbackPath(pathname));
  };

  return (
    <button
      type="button"
      className={className ? `back-btn ${className}` : "back-btn"}
      aria-label="Go back"
      onClick={goBack}
    >
      <ArrowLeft size={16} strokeWidth={1.75} />
      <span>Back</span>
    </button>
  );
}
