import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductCard({ product }) {
  const [colorIndex, setColorIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, duration: 22 });
  const colors = product.colors || [];
  const color = colors[colorIndex] || { hex: "#1A1A1A", name: "Black", images: [] };

  const slides = useMemo(
    () =>
      colors.flatMap((entry, index) =>
        (entry.images?.length ? entry.images : [{ url: "", kind: entry.slug }]).map((image, imageIndex) => ({
          key: `${product.slug}-${entry.slug}-${imageIndex}`,
          url: image.url,
          kind: image.kind || entry.slug,
          colorIndex: index,
          hex: entry.hex,
        }))
      ),
    [colors, product.slug]
  );

  const selectColor = (index) => {
    setColorIndex(index);
    const target = slides.findIndex((slide) => slide.colorIndex === index);
    if (target >= 0) emblaApi?.scrollTo(target);
  };

  const href = `/product/${product.slug}${color.slug ? `?color=${color.slug}` : ""}`;

  return (
    <article className="product-card is-tinted" style={{ "--sku": color.hex || color.token }}>
      <div className="card-media">
        {product.sale ? <span className="sale-pill">Sale</span> : null}
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((slide) => (
              <div className="embla__slide" key={slide.key}>
                {slide.url ? (
                  <img className="slide-photo" src={slide.url} alt={product.title} />
                ) : (
                  <div className="slide-face" data-kind={slide.kind} style={{ "--sku": slide.hex }}>
                    <div className="slide-object" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <button className="card-arrow prev" type="button" aria-label="Previous image" onClick={() => emblaApi?.scrollPrev()}>
          <ChevronLeft size={16} />
        </button>
        <button className="card-arrow next" type="button" aria-label="Next image" onClick={() => emblaApi?.scrollNext()}>
          <ChevronRight size={16} />
        </button>
        <Link className="choose-bar" to={href}>
          Choose
        </Link>
      </div>
      <Link to={href} className="card-title">
        {product.title}
      </Link>
      <p className="card-price">
        {product.compare_at ? <s>${Number(product.compare_at).toFixed(2)}</s> : null}
        ${Number(product.price).toFixed(2)}
      </p>
      <div className="swatches" role="listbox" aria-label={`${product.title} colors`}>
        {colors.map((entry, index) => (
          <button
            key={entry.slug}
            type="button"
            role="option"
            aria-selected={index === colorIndex}
            aria-label={entry.name}
            title={entry.name}
            className={index === colorIndex ? "swatch is-on" : "swatch"}
            style={{ "--swatch": entry.hex }}
            onClick={() => selectColor(index)}
          />
        ))}
      </div>
    </article>
  );
}
