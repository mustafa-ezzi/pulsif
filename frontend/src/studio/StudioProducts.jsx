import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteStudioProduct, getStudioProducts } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";

export function StudioProducts() {
  usePageTitle("Products");
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const { data, error, isLoading } = useQuery({
    queryKey: ["studio-products", query, status],
    queryFn: () => getStudioProducts({ q: query, status }),
  });
  const products = Array.isArray(data) ? data : data?.results || [];

  const remove = async (product) => {
    if (!window.confirm(`Delete “${product.title}”? This cannot be undone.`)) return;
    try {
      await deleteStudioProduct(product.id);
      queryClient.invalidateQueries({ queryKey: ["studio-products"] });
    } catch (err) {
      window.alert(err.message || "Could not delete this product.");
    }
  };

  return (
    <div className="studio-page">
      <p className="eyebrow">Catalog</p>
      <div className="studio-head">
        <h1 className="display">Products</h1>
        <Link className="cta-volt neu-btn" to="/studio/products/new">
          New product
        </Link>
      </div>
      <p className="page__lede">Search, publish, and open a product to edit the color × size matrix.</p>
      <div className="studio-filters">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title or slug"
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All status</option>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      {isLoading ? <p>Loading products…</p> : null}
      {error ? <p className="studio-error">{error.message}</p> : null}
      <div className="studio-scroll">
      <table className="studio-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Variants</th>
            <th>Images</th>
            <th>Min stock</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <Link to={`/studio/products/${product.id}`}>{product.title}</Link>
                <div className="studio-muted">{product.slug}</div>
              </td>
              <td>
                <span className={`studio-status is-${product.status}`}>{product.status}</span>
              </td>
              <td>{product.variant_count}</td>
              <td>{product.image_count}</td>
              <td>{product.min_stock ?? "—"}</td>
              <td>
                <button type="button" className="text-link studio-delete" onClick={() => remove(product)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {!isLoading && !products.length ? <p className="studio-muted">No products match that filter.</p> : null}
    </div>
  );
}
