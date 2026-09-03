import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Flip, gsap } from "../register";
import { LAB_PRODUCTS } from "../../data/labProducts";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "pink", label: "Pink" },
  { id: "purple", label: "Purple" },
  { id: "black", label: "Black" },
];

function matches(product, filter) {
  if (filter === "all") return true;
  if (filter === "women" || filter === "men") return product.gender === filter || product.gender === "unisex";
  return product.colors.some((color) => color.slug === filter);
}

export function FlipLab() {
  const rootRef = useRef(null);
  const [filter, setFilter] = useState("all");

  const applyFilter = (next) => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll(".flip-item");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = Flip.getState(items);

    items.forEach((item) => {
      const product = LAB_PRODUCTS.find((entry) => entry.id === item.dataset.id);
      item.classList.toggle("is-hidden", !matches(product, next));
    });

    setFilter(next);

    if (reduce) return;
    Flip.from(state, {
      duration: 0.55,
      ease: "power2.out",
      nested: true,
      simple: true,
    });
  };

  useGSAP(
    () => {
      gsap.from(".flip-item", { y: 20, autoAlpha: 0, stagger: 0.05, duration: 0.6 });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="flip-lab">
      <p className="eyebrow">Catalog R&D</p>
      <h1 className="display">Flip filters</h1>
      <div className="filters">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={filter === entry.id ? "lab-chip on" : "lab-chip"}
            onClick={() => applyFilter(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="flip-grid">
        {LAB_PRODUCTS.map((product) => (
          <article key={product.id} className="flip-item lab-tile" data-id={product.id}>
            <p className="eyebrow">{product.gender}</p>
            <h2>{product.title}</h2>
            <p>${product.price.toFixed(2)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
