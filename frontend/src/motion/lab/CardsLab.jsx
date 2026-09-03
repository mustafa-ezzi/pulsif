import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../register";
import { LAB_PRODUCTS } from "../../data/labProducts";
import { ProductCard } from "./ProductCard";

export function CardsLab() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.from(".product-card", {
        y: 24,
        autoAlpha: 0,
        stagger: 0.06,
        duration: 0.7,
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="cards-lab" id="lab-cards">
      <p className="eyebrow">The Pulsif Floor</p>
      <h1 className="display">Built to Tell Your Story</h1>
      <div className="card-grid">
        {LAB_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
