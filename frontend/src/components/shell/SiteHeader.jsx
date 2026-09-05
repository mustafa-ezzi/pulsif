import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { gsap } from "../../motion/register";
import { useCartStore } from "../../store/cartStore";
import { useUiStore } from "../../store/uiStore";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BackButton } from "../ui/BackButton";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/catalog", label: "Catalog" },
  { to: "/contact", label: "Contact" },
  { to: "/faqs", label: "FAQs" },
];

export function SiteHeader() {
  const location = useLocation();
  const headerRef = useRef(null);
  const badgeRef = useRef(null);
  const reduce = useReducedMotion();
  const [solid, setSolid] = useState(location.pathname !== "/");
  const [hidden, setHidden] = useState(false);
  const lines = useCartStore((state) => state.lines);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const openSearch = useUiStore((state) => state.openSearch);
  const openCart = useUiStore((state) => state.openCart);
  const openNav = useUiStore((state) => state.openNav);
  const drawerOpen = useUiStore(
    (state) => state.cartOpen || state.searchOpen || state.navOpen
  );

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const isHome = location.pathname === "/";
      setSolid(!isHome || y > 8);
      if (drawerOpen) {
        setHidden(false);
      } else if (y > 80 && y > last + 4) {
        setHidden(true);
      } else if (y < last - 4 || y < 16) {
        setHidden(false);
      }
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname, drawerOpen]);

  useGSAP(
    () => {
      if (!headerRef.current) return;
      gsap.to(headerRef.current, {
        y: hidden ? -100 : 0,
        duration: reduce ? 0 : 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    { dependencies: [hidden, reduce] }
  );

  useGSAP(
    () => {
      if (!badgeRef.current || count < 1) return;
      gsap.fromTo(
        badgeRef.current,
        { scale: 1.2 },
        { scale: 1, duration: reduce ? 0 : 0.35, ease: "power3.out" }
      );
    },
    { dependencies: [count, reduce] }
  );

  return (
    <header
      ref={headerRef}
      className={solid ? "site-header is-solid" : "site-header"}
    >
      <div className="site-header__brand">
        <button
          className="site-icon-btn site-header__menu"
          type="button"
          aria-label="Open menu"
          onClick={openNav}
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
        <BackButton />
        <Link to="/" className="site-logo" aria-label="PowerPulse LLC">
          <span className="site-logo__name">
            PowerPulse <span className="site-logo__llc">LLC</span>
          </span>
        </Link>
      </div>

      <nav className="site-nav" aria-label="Primary">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="site-utils">
        <button className="site-icon-btn" type="button" aria-label="Search" onClick={openSearch}>
          <Search size={18} strokeWidth={1.5} />
        </button>
        <Link className="site-icon-btn site-header__account" to="/account" aria-label="Account">
          <User size={18} strokeWidth={1.5} />
        </Link>
        <button className="site-cart-btn" type="button" aria-label={`Cart, ${count} items`} onClick={openCart}>
          <ShoppingBag className="site-cart-btn__bag" size={18} strokeWidth={1.5} />
          <span className="site-cart-btn__label">Cart</span>
          <span ref={badgeRef} className={count ? "site-cart-btn__count" : "site-cart-btn__count is-zero"}>
            {count}
          </span>
        </button>
      </div>
    </header>
  );
}
