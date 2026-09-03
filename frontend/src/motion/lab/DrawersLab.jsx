import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { X } from "lucide-react";
import { gsap } from "../register";
import { LAB_PRODUCTS } from "../../data/labProducts";
import { useLabStore } from "../../store/labStore";

function lockScroll(lock) {
  document.body.style.overflow = lock ? "hidden" : "";
}

function useDrawerMotion(rootRef, open) {
  const primed = useRef(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const panel = root.querySelector(".drawer-panel");
      const backdrop = root.querySelector(".drawer-backdrop");
      const items = root.querySelectorAll(".search-item");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduce ? 0 : 0.45;

      if (!primed.current) {
        gsap.set(panel, { xPercent: 100 });
        gsap.set(backdrop, { autoAlpha: 0 });
        primed.current = true;
        if (!open) return;
      }

      gsap.to(backdrop, { autoAlpha: open ? 1 : 0, duration: reduce ? 0 : 0.3 });
      gsap.to(panel, { xPercent: open ? 0 : 100, duration, ease: "power3.out" });

      if (open && items.length && !reduce) {
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.4, delay: 0.12 }
        );
      }
    },
    { dependencies: [open], revertOnUpdate: false }
  );
}

export function DrawersLab() {
  const cartOpen = useLabStore((state) => state.cartOpen);
  const searchOpen = useLabStore((state) => state.searchOpen);
  const setCartOpen = useLabStore((state) => state.setCartOpen);
  const setSearchOpen = useLabStore((state) => state.setSearchOpen);
  const closeDrawers = useLabStore((state) => state.closeDrawers);
  const cartRef = useRef(null);
  const searchRef = useRef(null);
  const closeCartRef = useRef(null);
  const closeSearchRef = useRef(null);

  useDrawerMotion(cartRef, cartOpen);
  useDrawerMotion(searchRef, searchOpen);

  useEffect(() => {
    const open = cartOpen || searchOpen;
    lockScroll(open);
    const onKey = (event) => {
      if (event.key === "Escape") closeDrawers();
    };
    window.addEventListener("keydown", onKey);
    if (cartOpen) closeCartRef.current?.focus();
    if (searchOpen) closeSearchRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [cartOpen, searchOpen, closeDrawers]);

  return (
    <section className="drawers-lab">
      <p className="eyebrow">Global chrome</p>
      <h1 className="display">Cart & Search</h1>
      <p style={{ color: "var(--mist)", maxWidth: "52ch" }}>
        Right-side drawers, dimmed backdrop, body scroll lock, Escape to close. Empty cart
        matches the Pellicor pattern.
      </p>
      <div className="drawers-stage">
        <button className="cta-volt neu-btn" type="button" onClick={() => setCartOpen(true)}>
          Open cart
        </button>
        <button className="cta-volt neu-btn" type="button" onClick={() => setSearchOpen(true)}>
          Open search
        </button>
      </div>

      <div className={cartOpen ? "drawer-root is-open" : "drawer-root"} ref={cartRef} aria-hidden={!cartOpen}>
        <button className="drawer-backdrop" type="button" aria-label="Close cart" onClick={closeDrawers} />
        <aside className="drawer-panel" role="dialog" aria-modal={cartOpen} aria-labelledby="cart-title">
          <button className="drawer-close" type="button" aria-label="Close" ref={closeCartRef} onClick={closeDrawers}>
            <X size={16} />
          </button>
          <h2 id="cart-title" className="display">
            Your cart is empty
          </h2>
          <p className="drawer-empty">Have an account? Log in to check out faster.</p>
          <button className="cta-volt neu-btn" type="button" onClick={closeDrawers}>
            Continue shopping
          </button>
        </aside>
      </div>

      <div className={searchOpen ? "drawer-root is-open" : "drawer-root"} ref={searchRef} aria-hidden={!searchOpen}>
        <button className="drawer-backdrop" type="button" aria-label="Close search" onClick={closeDrawers} />
        <aside className="drawer-panel" role="dialog" aria-modal={searchOpen} aria-labelledby="search-title">
          <button className="drawer-close" type="button" aria-label="Close" ref={closeSearchRef} onClick={closeDrawers}>
            <X size={16} />
          </button>
          <p className="eyebrow">Search</p>
          <h2 id="search-title" className="display">
            Products
          </h2>
          <div className="search-list">
            {LAB_PRODUCTS.map((product) => (
              <button key={product.id} type="button" className="search-item">
                {product.title}
                <span style={{ float: "right" }}>${product.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
