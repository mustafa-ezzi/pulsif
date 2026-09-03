import { useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductCard({ product }) {
  const [colorIndex, setColorIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, duration: 22 });
  const color = product.colors[colorIndex];

  const slides = useMemo(
    () => product.colors.flatMap((entry, index) => entry.slides.map((kind) => ({ kind, colorIndex: index }))),
    [product]
  );

  const selectColor = (index) => {
    setColorIndex(index);
    const target = slides.findIndex((slide) => slide.colorIndex === index);
    if (target >= 0) emblaApi?.scrollTo(target);
  };

  return (
    <article
      className="product-card is-tinted"
      style={{ "--sku": color.token }}
    >
      <div className="card-media">
        {product.sale ? <span className="sale-pill">Sale</span> : null}
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((slide) => (
              <div className="embla__slide" key={`${product.id}-${slide.kind}`}>
                <div className="slide-face" data-kind={slide.kind}>
                  <div className="slide-object" />
                </div>
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
        <button className="choose-bar" type="button">
          Choose
        </button>
      </div>
      <h3 className="card-title">{product.title}</h3>
      <p className="card-price">
        {product.compareAt ? <s>${product.compareAt.toFixed(2)}</s> : null}
        ${product.price.toFixed(2)}
      </p>
      <div className="swatches" role="listbox" aria-label={`${product.title} colors`}>
        {product.colors.map((entry, index) => (
          <button
            key={entry.slug}
            type="button"
            role="option"
            aria-selected={index === colorIndex}
            aria-label={entry.name}
            title={entry.name}
            className={index === colorIndex ? "swatch is-on" : "swatch"}
            style={{ "--swatch": entry.token }}
            onClick={() => selectColor(index)}
          />
        ))}
      </div>
    </article>
  );
}
