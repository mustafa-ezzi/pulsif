import { useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../motion/register";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ProductCard } from "../product/ProductCard";

function archiveProducts(archive) {
  const list = [...(archive?.products || []), ...(archive?.women || []), ...(archive?.men || [])];
  const seen = new Set();
  return list.filter((product) => {
    if (!product?.slug || seen.has(product.slug)) return false;
    seen.add(product.slug);
    return true;
  });
}

export function Archive({ archive }) {
  const gridRef = useRef(null);
  const reduce = useReducedMotion();
  const products = archiveProducts(archive);

  useGSAP(
    () => {
      if (reduce || !products.length) return;
      gsap.from(".product-card", { y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.7 });
    },
    { scope: gridRef, dependencies: [products, reduce], revertOnUpdate: true }
  );

  if (!archive || !products.length) return null;

  return (
    <section className="archive">
      <p className="eyebrow">{archive.eyebrow}</p>
      <h2 className="display archive__title">{archive.title}</h2>
      <div ref={gridRef} className="card-grid archive__grid">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      <Link className="text-link archive__all" to="/catalog">
        View All →
      </Link>
    </section>
  );
}
