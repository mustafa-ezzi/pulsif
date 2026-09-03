import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/client";
import { Flip, gsap } from "../motion/register";
import { usePageTitle } from "../hooks/usePageTitle";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ProductCard } from "../components/product/ProductCard";
import { FilterBar } from "../components/catalog/FilterBar";

const TITLES = {
  men: "Men's",
  women: "Women's",
};

const PAGE_SIZE = 12;

export function CatalogPage() {
  const { gender } = useParams();
  const validGender = gender === "men" || gender === "women" ? gender : undefined;
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const gridRef = useRef(null);
  const flipState = useRef(null);
  const reduce = useReducedMotion();
  const title = TITLES[validGender] || "The Floor";
  usePageTitle(validGender ? `${title} accessories` : "Catalog");

  const query = {
    color: params.get("color") || "",
    category: params.get("category") || "",
    sort: params.get("sort") || "",
    price_min: params.get("price_min") || "",
    price_max: params.get("price_max") || "",
  };

  const filters = {
    gender: validGender,
    color: query.color,
    category: query.category,
    sort: query.sort || "featured",
    price_min: query.price_min,
    price_max: query.price_max,
    limit,
    offset: 0,
  };

  const { data, isFetching } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const products = data?.results || [];
  const count = data?.count || 0;
  const facets = data?.facets;

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [validGender, query.color, query.category, query.sort, query.price_min, query.price_max]);

  const captureFlip = () => {
    const grid = gridRef.current;
    if (!grid || reduce) return;
    const items = grid.querySelectorAll("[data-flip-id]");
    Flip.killFlipsOf(items);
    flipState.current = Flip.getState(items);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    const grid = gridRef.current;
    if (!state || !grid || reduce) {
      flipState.current = null;
      return undefined;
    }

    const items = grid.querySelectorAll("[data-flip-id]");
    const tween = Flip.from(state, {
      duration: 0.45,
      ease: "power2.out",
      targets: items,
      scale: false,
      simple: true,
      onEnter: (elements) =>
        gsap.fromTo(elements, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04 }),
    });
    flipState.current = null;

    return () => {
      tween?.kill();
      Flip.killFlipsOf(items);
    };
  }, [products, reduce]);

  const onChange = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setLimit(PAGE_SIZE);
    setParams(next, { replace: true });
  };

  const genderHref = (nextGender) => {
    const search = params.toString();
    const path = nextGender ? `/catalog/${nextGender}` : "/catalog";
    return search ? `${path}?${search}` : path;
  };

  return (
    <section className="page">
      <p className="eyebrow">Catalog</p>
      <h1 className="display page__title">{title}</h1>
      <FilterBar
        gender={validGender}
        query={query}
        facets={facets}
        genderHref={genderHref}
        onBeforeChange={captureFlip}
        onChange={onChange}
      />
      <div ref={gridRef} className="card-grid catalog-grid">
        {products.map((product) => (
          <div key={product.slug} className="catalog-item" data-flip-id={product.slug}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {!products.length && !isFetching ? (
        <div className="empty-state">
          <p className="page__lede">Nothing on this filter. Try another color or type, or clear back to the full floor.</p>
          <Link className="text-link" to="/catalog">
            View all products →
          </Link>
        </div>
      ) : null}
      {products.length < count ? (
        <button
          className="cta-volt neu-btn catalog-more"
          type="button"
          onClick={() => setLimit((value) => value + PAGE_SIZE)}
        >
          Load more
        </button>
      ) : null}
    </section>
  );
}
