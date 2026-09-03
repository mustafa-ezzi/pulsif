import { useQuery } from "@tanstack/react-query";
import { getHome } from "../api/client";
import { VideoHero } from "../components/landing/VideoHero";
import { HeroStack } from "../components/landing/HeroStack";
import { Archive } from "../components/landing/Archive";
import { PromoBanner } from "../components/landing/PromoBanner";
import { Lookbook } from "../components/landing/Lookbook";
import { GenderTiles } from "../components/landing/GenderTiles";
import { usePageTitle } from "../hooks/usePageTitle";
import { JsonLd } from "../components/seo/JsonLd";
import { HERO_CHAPTERS, LAB_PRODUCTS } from "../data/labProducts";

function mapLabProduct(product) {
  return {
    slug: product.id,
    title: product.title,
    price: product.price,
    compare_at: product.compareAt,
    sale: product.sale,
    gender: product.gender,
    colors: product.colors.map((color) => ({
      slug: color.slug,
      name: color.name,
      hex: color.token.replace("var(--sku-", "").includes("#") ? color.token : undefined,
      token: color.token,
      images: color.slides.map((kind) => ({ url: "", kind })),
    })),
  };
}

const FALLBACK = {
  heroes: HERO_CHAPTERS.map((chapter, index) => ({
    id: chapter.id,
    eyebrow: chapter.eyebrow,
    headline: chapter.lines.join("\n"),
    lines: chapter.lines,
    cta_label: chapter.cta,
    cta_href: index === 0 ? "/catalog/women" : index === 2 ? "/catalog/men" : "/catalog",
    image: "",
    tone: chapter.tone,
  })),
  archive: {
    eyebrow: "The Pulsif Floor",
    title: "Built to Tell Your Story",
    men: LAB_PRODUCTS.filter((item) => item.gender !== "women").map(mapLabProduct),
    women: LAB_PRODUCTS.filter((item) => item.gender !== "men").map(mapLabProduct),
  },
  beyond: {
    eyebrow: "Beyond the Session",
    headline: "A Lifetime of Training.",
    cta_label: "View the Collection",
    cta_href: "/catalog",
    tone: "volt",
  },
  essentials: {
    eyebrow: "Pulsif Essentials",
    headline: "Shop now",
    cta_label: "Shop now",
    cta_href: "/catalog",
    tone: "graphite",
  },
  lookbook: {
    eyebrow: "Spring delivery",
    headline: "Shop the Look",
    tone: "pink",
    products: LAB_PRODUCTS.slice(0, 3).map(mapLabProduct),
  },
  gender_tiles: [
    { label: "Women", href: "/catalog/women" },
    { label: "Men", href: "/catalog/men" },
    { label: "Shop All", href: "/catalog" },
  ],
};

export function HomePage() {
  usePageTitle("", "Pulsif — pilates boards, bands, and lifting grips. Shop the floor.");
  const { data } = useQuery({
    queryKey: ["home"],
    queryFn: getHome,
    staleTime: 30_000,
    retry: 1,
  });
  const home = data || FALLBACK;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Pulsif",
          url: "https://pulsif.store",
        }}
      />
      <VideoHero />
      {data?.heroes?.length ? (
        <HeroStack chapters={data.heroes} />
      ) : (
        <div className="hero-stack" aria-hidden="true">
          <section className="hero-chapter">
            <div className="hero-chapter__pin">
              <div className="hero-media" data-tone="pink" />
            </div>
          </section>
        </div>
      )}
      <Archive archive={home.archive} />
      <PromoBanner banner={home.beyond} tall />
      <PromoBanner banner={home.essentials} />
      <Lookbook lookbook={home.lookbook} />
      <GenderTiles tiles={home.gender_tiles} />
    </>
  );
}
