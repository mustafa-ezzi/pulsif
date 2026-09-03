import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCarouselItem,
  deleteCarouselItem,
  getStudioBundle,
  getStudioProducts,
  patchBanner,
  patchCarouselItem,
  patchHero,
} from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";

function Frame({ ratio, src, hint }) {
  return (
    <div className="studio-frame" style={{ aspectRatio: ratio }}>
      {src ? <img src={src} alt="" /> : <span>{hint}</span>}
    </div>
  );
}

function HeroEditor({ chapter, onSaved }) {
  const save = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("image");
    if (!file || file.size === 0) form.delete("image");
    await patchHero(chapter.id, form);
    onSaved();
  };

  return (
    <form className="studio-card" onSubmit={save}>
      <Frame ratio="9 / 16" src={chapter.image} hint="9:16 hero" />
      <label>
        Eyebrow
        <input name="eyebrow" defaultValue={chapter.eyebrow} />
      </label>
      <label>
        Headline (line break = new line)
        <textarea name="headline" rows={3} defaultValue={chapter.headline} />
      </label>
      <label>
        CTA
        <input name="cta_label" defaultValue={chapter.cta_label} />
      </label>
      <label>
        Link
        <input name="cta_href" defaultValue={chapter.cta_href} />
      </label>
      <label>
        Replace image
        <input name="image" type="file" accept="image/*" />
      </label>
      <button className="cta-volt neu-btn" type="submit">
        Save chapter
      </button>
    </form>
  );
}

function BannerEditor({ banner, onSaved }) {
  const save = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("image");
    if (!file || file.size === 0) form.delete("image");
    await patchBanner(banner.key, form);
    onSaved();
  };

  return (
    <form className="studio-card" onSubmit={save}>
      <Frame ratio="16 / 9" src={banner.image} hint="16:9 banner" />
      <p className="eyebrow">{banner.key}</p>
      <label>
        Eyebrow
        <input name="eyebrow" defaultValue={banner.eyebrow} />
      </label>
      <label>
        Headline
        <input name="headline" defaultValue={banner.headline} />
      </label>
      <label>
        CTA
        <input name="cta_label" defaultValue={banner.cta_label} />
      </label>
      <label>
        Link
        <input name="cta_href" defaultValue={banner.cta_href} />
      </label>
      <label>
        Replace image
        <input name="image" type="file" accept="image/*" />
      </label>
      <button className="cta-volt neu-btn" type="submit">
        Save banner
      </button>
    </form>
  );
}

function SlotEditor({ carousel, products, onSaved }) {
  const items = carousel.items || [];

  const move = async (item, direction) => {
    const index = items.findIndex((row) => row.id === item.id);
    const other = items[index + direction];
    if (!other) return;
    await patchCarouselItem(item.id, { sort: index + direction });
    await patchCarouselItem(other.id, { sort: index });
    onSaved();
  };

  const add = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const product = form.get("product");
    if (!product) return;
    await createCarouselItem({
      carousel_key: carousel.key,
      product: Number(product),
      sort: items.length,
      href: `/product/${products.find((row) => String(row.id) === String(product))?.slug || ""}`,
    });
    event.currentTarget.reset();
    onSaved();
  };

  return (
    <section className="studio-slot">
      <p className="eyebrow">{carousel.title}</p>
      <p className="studio-muted">{carousel.key} · 4:5 crop on product cards</p>
      <div className="studio-slot-list">
        {items.map((item, index) => (
          <article key={item.id} className="studio-card studio-slot-card">
            <Frame ratio="4 / 5" src={item.image || item.product?.colors?.[0]?.images?.[0]?.url} hint="4:5" />
            <label>
              Product
              <select
                defaultValue={item.product?.id || ""}
                onChange={async (event) => {
                  const next = products.find((row) => String(row.id) === event.target.value);
                  await patchCarouselItem(item.id, {
                    product: Number(event.target.value),
                    href: next ? `/product/${next.slug}` : item.href,
                    title: next?.title || item.title,
                  });
                  onSaved();
                }}
              >
                <option value="">Choose</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </label>
            <p>{item.product?.title || item.title}</p>
            <div className="studio-chip-row">
              <button type="button" className="studio-chip" disabled={index === 0} onClick={() => move(item, -1)}>
                Up
              </button>
              <button
                type="button"
                className="studio-chip"
                disabled={index === items.length - 1}
                onClick={() => move(item, 1)}
              >
                Down
              </button>
              <button
                type="button"
                className="text-link"
                onClick={async () => {
                  await deleteCarouselItem(item.id);
                  onSaved();
                }}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      <form className="studio-form studio-form--inline" onSubmit={add}>
        <label>
          Add product
          <select name="product" defaultValue="">
            <option value="">Choose</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
        </label>
        <button className="cta-volt neu-btn" type="submit">
          Add to slot
        </button>
      </form>
    </section>
  );
}

export function StudioCarousels() {
  usePageTitle("Carousels");
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["studio-carousels"],
    queryFn: getStudioBundle,
  });
  const { data: productData } = useQuery({
    queryKey: ["studio-products"],
    queryFn: () => getStudioProducts(),
  });
  const products = Array.isArray(productData) ? productData : productData?.results || [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["studio-carousels"] });
    queryClient.invalidateQueries({ queryKey: ["home"] });
    queryClient.invalidateQueries({ queryKey: ["studio-dashboard"] });
  };

  if (isLoading) return <p className="studio-page">Loading carousels…</p>;
  if (error) return <p className="studio-page studio-error">{error.message}</p>;

  return (
    <div className="studio-page">
      <p className="eyebrow">Home</p>
      <h1 className="display">Carousels</h1>
      <p className="page__lede">
        Swap hero and banner images, then edit every archive and lookbook slot. Crop hints: heroes 9:16, banners 16:9,
        cards 4:5.
      </p>

      <h2 className="studio-h2">Hero stack</h2>
      <div className="studio-grid">
        {data.heroes.map((chapter) => (
          <HeroEditor key={chapter.id} chapter={chapter} onSaved={refresh} />
        ))}
      </div>

      <h2 className="studio-h2">Banners</h2>
      <div className="studio-grid">
        {data.banners.map((banner) => (
          <BannerEditor key={banner.key} banner={banner} onSaved={refresh} />
        ))}
      </div>

      <h2 className="studio-h2">Archive & lookbook slots</h2>
      {data.carousels.map((carousel) => (
        <SlotEditor key={carousel.key} carousel={carousel} products={products} onSaved={refresh} />
      ))}
    </div>
  );
}
