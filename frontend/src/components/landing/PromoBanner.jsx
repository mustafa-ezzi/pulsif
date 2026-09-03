import { Link } from "react-router-dom";

export function PromoBanner({ banner, tall = false }) {
  if (!banner) return null;
  return (
    <section
      className={tall ? "promo-banner promo-banner--tall" : "promo-banner"}
      data-tone={banner.tone}
      style={banner.image ? { "--hero-img": `url("${banner.image}")` } : undefined}
    >
      <div className="promo-banner__copy">
        <p className="eyebrow">{banner.eyebrow}</p>
        <h2 className="display">{banner.headline}</h2>
        {banner.cta_label ? (
          <Link className="text-link" to={banner.cta_href || "/catalog"}>
            {banner.cta_label} →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
