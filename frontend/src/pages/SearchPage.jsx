import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";
import { ProductCard } from "../components/product/ProductCard";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  usePageTitle(q ? `Search "${q}"` : "Search");
  const { data, isFetching } = useQuery({
    queryKey: ["search-page", q],
    queryFn: () => getProducts({ q, limit: 24 }),
    retry: 1,
  });
  const results = data?.results || [];

  return (
    <section className="page">
      <p className="eyebrow">Search</p>
      <h1 className="display page__title">{q || "All products"}</h1>
      {!results.length && !isFetching ? (
        <p className="page__lede">No matches. Try board, band, or grips.</p>
      ) : (
        <div className="card-grid catalog-grid">
          {results.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
