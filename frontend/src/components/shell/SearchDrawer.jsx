import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../motion/register";
import { getProducts } from "../../api/client";
import { useUiStore } from "../../store/uiStore";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { DrawerFrame } from "./DrawerFrame";

export function SearchDrawer() {
  const open = useUiStore((state) => state.searchOpen);
  const closeAll = useUiStore((state) => state.closeAll);
  const [query, setQuery] = useState("");
  const listRef = useRef(null);
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const { data } = useQuery({
    queryKey: ["search-drawer", query],
    queryFn: () => getProducts({ q: query.trim(), limit: 8 }),
    enabled: open,
    retry: 1,
  });
  const results = data?.results || [];

  useGSAP(
    () => {
      if (!open || reduce) return;
      gsap.fromTo(
        ".search-item",
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.4 }
      );
    },
    { scope: listRef, dependencies: [open, results, reduce] }
  );

  const go = (event) => {
    event.preventDefault();
    const q = query.trim();
    closeAll();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const label = useMemo(() => (query.trim() ? `Results for ${query}` : "Products"), [query]);

  return (
    <DrawerFrame open={open} onClose={closeAll} titleId="search-title">
      <p className="eyebrow">Search</p>
      <h2 id="search-title" className="display site-drawer__title">
        {label}
      </h2>
      <form className="newsletter" onSubmit={go}>
        <label className="sr-only" htmlFor="drawer-search">
          Search products
        </label>
        <input
          id="drawer-search"
          type="search"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
      <div className="search-list" ref={listRef}>
        {results.map((product) => (
          <button
            key={product.slug}
            type="button"
            className="search-item"
            onClick={() => {
              closeAll();
              navigate(`/product/${product.slug}`);
            }}
          >
            {product.title}
            <span>${Number(product.price).toFixed(2)}</span>
          </button>
        ))}
      </div>
      <button className="text-link" type="button" onClick={go} style={{ marginTop: 20 }}>
        View all →
      </button>
    </DrawerFrame>
  );
}
