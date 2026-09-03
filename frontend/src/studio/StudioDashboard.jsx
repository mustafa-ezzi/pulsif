import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudioDashboard } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";

const STATUSES = ["pending", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"];

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function StudioDashboard() {
  usePageTitle("Studio");
  const { data, error, isLoading } = useQuery({
    queryKey: ["studio-dashboard"],
    queryFn: getStudioDashboard,
  });

  if (isLoading) return <p className="studio-page">Loading dashboard…</p>;
  if (error) return <p className="studio-page studio-error">{error.message}</p>;

  return (
    <div className="studio-page">
      <p className="eyebrow">Overview</p>
      <h1 className="display">Dashboard</h1>
      <p className="page__lede">Seven-day trade, pipeline, stock, and anything missing an image.</p>

      <div className="studio-stats">
        <article className="studio-stat">
          <p className="eyebrow">7-day revenue</p>
          <h2>{money(data.revenue_7d)}</h2>
        </article>
        <article className="studio-stat">
          <p className="eyebrow">Orders this week</p>
          <h2>{data.orders_7d}</h2>
        </article>
        <article className="studio-stat">
          <p className="eyebrow">Low stock</p>
          <h2>{data.low_stock.length}</h2>
        </article>
        <article className="studio-stat">
          <p className="eyebrow">Broken slots</p>
          <h2>{data.broken.length}</h2>
        </article>
      </div>

      <h2 className="studio-h2">Orders by status</h2>
      <div className="studio-pills">
        {STATUSES.map((status) => (
          <Link key={status} className="studio-pill" to={`/studio/orders?status=${status}`}>
            <span>{status}</span>
            <strong>{data.by_status?.[status] || 0}</strong>
          </Link>
        ))}
      </div>

      <h2 className="studio-h2">Low stock</h2>
      {data.low_stock.length ? (
        <table className="studio-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Variant</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.low_stock.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link to={`/studio/products/${row.product_id}`}>{row.title}</Link>
                </td>
                <td>{row.sku}</td>
                <td>
                  {row.color} / {row.size}
                </td>
                <td>{row.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="studio-muted">All live variants are at 5 or more.</p>
      )}

      <h2 className="studio-h2">Missing images</h2>
      {data.broken.length ? (
        <ul className="studio-broken">
          {data.broken.map((item, index) => (
            <li key={`${item.key}-${index}`}>
              <Link to="/studio/carousels">
                {item.kind} · {item.title}
              </Link>
              <span>{item.reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="studio-muted">Heroes, banners, and carousel items all have images.</p>
      )}
    </div>
  );
}
