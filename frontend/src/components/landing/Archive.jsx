import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../motion/register";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ProductCard } from "../product/ProductCard";

export function Archive({ archive }) {
  const [tab, setTab] = useState("women");
  const gridRef = useRef(null);
  const reduce = useReducedMotion();
  const products = tab === "women" ? archive?.women || [] : archive?.men || [];

  useGSAP(
    () => {
      if (reduce || !products.length) return;
      gsap.from(".product-card", { y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.7 });
    },
    { scope: gridRef, dependencies: [tab, products, reduce], revertOnUpdate: true }
  );

  if (!archive) return null;

  return (
    <section className="archive">
      <p className="eyebrow">{archive.eyebrow}</p>
      <h2 className="display archive__title">{archive.title}</h2>
      <div className="archive__tabs" role="tablist">
        {["men", "women"].map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? "is-on" : undefined}
            onClick={() => setTab(key)}
          >
            {key === "men" ? "Men" : "Women"}
          </button>
        ))}
      </div>
      <div ref={gridRef} className="card-grid archive__grid">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      <Link className="text-link archive__all" to={tab === "women" ? "/catalog/women" : "/catalog/men"}>
        View All →
      </Link>
    </section>
  );
}
