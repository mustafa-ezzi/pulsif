import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/client";
import { useCartStore } from "../store/cartStore";
import { useUiStore } from "../store/uiStore";
import { usePageTitle } from "../hooks/usePageTitle";
import { Gallery } from "../components/product/Gallery";
import { VariantPicker } from "../components/product/VariantPicker";
import { SizeGuide } from "../components/product/SizeGuide";
import { Accordion } from "../components/ui/Accordion";
import { ProductCard } from "../components/product/ProductCard";
import { QtyStepper } from "../components/ui/QtyStepper";
import { JsonLd } from "../components/seo/JsonLd";

export function ProductPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: product, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduct(slug),
    retry: 1,
  });
  const addLine = useCartStore((state) => state.addLine);
  const openCart = useUiStore((state) => state.openCart);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [pending, setPending] = useState(false);
  const galleryRef = useRef(null);
  usePageTitle(product?.title || "Product", product?.subtitle || product?.description);

  const colors = product?.colors || [];
  const colorParam = params.get("color");
  const matchedColor = colors.findIndex((entry) => entry.slug === colorParam);
  const colorIndex = matchedColor < 0 ? 0 : matchedColor;
  const color = colors[colorIndex] || colors[0];

  const variants = useMemo(() => product?.variants || [], [product]);
  const sizes = useMemo(() => {
    if (!color) return [];
    return [...new Set(variants.filter((entry) => entry.color === color.slug).map((entry) => entry.size))];
  }, [variants, color]);

  useEffect(() => {
    if (!sizes.length) return;
    setSize((current) => (sizes.includes(current) ? current : sizes[0]));
  }, [sizes]);

  const variant = variants.find((entry) => entry.color === color?.slug && entry.size === size);

  const galleryImages = useMemo(() => {
    const fromColor = color?.images || [];
    if (fromColor.length) return fromColor;
    return (product?.images || []).filter((image) => !image.color || image.color === color?.slug);
  }, [color, product]);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => setSticky(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [product]);

  const selectColor = (index) => {
    const next = colors[index];
    const search = new URLSearchParams(params);
    if (next?.slug) search.set("color", next.slug);
    setParams(search, { replace: true });
  };

  const add = async () => {
    if (!variant?.id || pending) return;
    setPending(true);
    try {
      await addLine({ variantId: variant.id, qty });
      openCart();
    } finally {
      setPending(false);
    }
  };

  if (!product || isError) {
    return (
      <section className="page">
        <p className="eyebrow">Product</p>
        <h1 className="display page__title">Not found</h1>
        <Link className="text-link" to="/catalog">
          Back to catalog →
        </Link>
      </section>
    );
  }

  const price = Number(variant?.price ?? product.price);
  const compare = variant?.compare_at || product.compare_at;
  const hasGuide = Boolean(product.size_guide && (product.size_guide.rows || []).length);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.subtitle || product.description || "",
    image: galleryImages.map((image) => image.url).filter(Boolean),
    sku: variant?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: price.toFixed(2),
      availability: variant?.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <section className="page page--pdp">
      <JsonLd data={jsonLd} />
      <div className="pdp-layout">
        <div className="pdp-media" ref={galleryRef}>
          <Gallery images={galleryImages} alt={product.title} sku={color?.hex || color?.token} />
        </div>
        <div className="pdp-buy">
          <p className="pdp-crumb">
            <Link to="/catalog">Catalog</Link>
          </p>
          <h1 className="pdp-buy__title">{product.title}</h1>
          {product.subtitle ? <p className="pdp-buy__lede">{product.subtitle}</p> : null}
          <p className="pdp-buy__price">
            {compare ? <s>${Number(compare).toFixed(2)}</s> : null}
            <span>${price.toFixed(2)}</span>
          </p>
          <VariantPicker
            colors={colors}
            colorIndex={colorIndex}
            onColor={selectColor}
            sizes={sizes}
            size={size}
            onSize={setSize}
          />
          <div className="pdp-actions">
            <QtyStepper value={qty} onChange={(next) => setQty(Math.max(1, next))} />
            <button
              className="cta-volt neu-btn"
              type="button"
              onClick={add}
              disabled={!variant || pending || variant.stock === 0}
            >
              {pending ? "Adding…" : variant?.stock === 0 ? "Sold out" : "Add to bag"}
            </button>
          </div>
          <div className="pdp-buy__meta">
            {hasGuide ? (
              <button className="text-link" type="button" onClick={() => setGuideOpen(true)}>
                Size guide
              </button>
            ) : null}
            {product.shipping_note ? <p className="pdp-note">{product.shipping_note}</p> : null}
          </div>

          <div className="pdp-accordions">
            {product.features?.length ? (
              <Accordion title="Features">
                <ul>
                  {product.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Accordion>
            ) : null}
            {product.description ? (
              <Accordion title="Description">
                <p>{product.description}</p>
              </Accordion>
            ) : null}
            {product.care ? (
              <Accordion title="Care">
                <p>{product.care}</p>
              </Accordion>
            ) : null}
            <Accordion title="Specs">
              <p>SKU {variant?.sku || "—"}</p>
              {variant ? <p>Stock {variant.stock}</p> : null}
            </Accordion>
          </div>
        </div>
      </div>

      {product.related?.length ? (
        <div className="pdp-related">
          <p className="eyebrow">Related</p>
          <h2 className="pdp-related__title">Also on the floor</h2>
          <div className="card-grid catalog-grid">
            {product.related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </div>
      ) : null}

      {sticky ? (
        <div className="pdp-sticky">
          <span>
            {product.title}
            <em>
              {color?.name}
              {size ? ` / ${size}` : ""}
            </em>
          </span>
          <strong>${price.toFixed(2)}</strong>
          <button className="cta-volt neu-btn" type="button" onClick={add} disabled={!variant || pending || variant.stock === 0}>
            Add to bag
          </button>
        </div>
      ) : null}

      {guideOpen ? <SizeGuide guide={product.size_guide} onClose={() => setGuideOpen(false)} /> : null}
    </section>
  );
}
