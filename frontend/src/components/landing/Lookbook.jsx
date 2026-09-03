import { Link } from "react-router-dom";
import { ProductCard } from "../product/ProductCard";

export function Lookbook({ lookbook }) {
  if (!lookbook) return null;
  const featured = lookbook.products?.[0];

  return (
    <section className="lookbook">
      <div
        className="lookbook__hero"
        data-tone={lookbook.tone || "pink"}
        style={lookbook.image ? { "--hero-img": `url("${lookbook.image}")` } : undefined}
      >
        <div className="lookbook__hero-copy">
          <p className="eyebrow">{lookbook.eyebrow}</p>
          <h2 className="display">{lookbook.headline}</h2>
          {featured ? (
            <Link className="text-link" to={`/product/${featured.slug}`}>
              View {featured.title} →
            </Link>
          ) : null}
        </div>
      </div>
      <div className="lookbook__cards">
        <p className="eyebrow">Shop the Look</p>
        {(lookbook.products || []).slice(0, 3).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
