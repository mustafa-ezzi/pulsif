import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudioOrders } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";
import { useState } from "react";

const STATUSES = ["", "pending", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"];

export function StudioOrders() {
  usePageTitle("Orders");
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const [query, setQuery] = useState("");
  const { data, error, isLoading } = useQuery({
    queryKey: ["studio-orders", status, query],
    queryFn: () => getStudioOrders({ status, q: query }),
  });
  const orders = data || [];

  return (
    <div className="studio-page">
      <p className="eyebrow">Commerce</p>
      <h1 className="display">Orders</h1>
      <p className="page__lede">Filter the pipeline, then open an order to pack, ship, or refund.</p>
      <div className="studio-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Number, email, name" />
        <select
          value={status}
          onChange={(event) => {
            const next = new URLSearchParams(params);
            if (event.target.value) next.set("status", event.target.value);
            else next.delete("status");
            setParams(next);
          }}
        >
          {STATUSES.map((value) => (
            <option key={value || "all"} value={value}>
              {value || "All status"}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? <p>Loading orders…</p> : null}
      {error ? <p className="studio-error">{error.message}</p> : null}
      <div className="studio-scroll">
      <table className="studio-table">
        <thead>
          <tr>
            <th>Number</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Placed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link to={`/studio/orders/${order.number}`}>{order.number}</Link>
              </td>
              <td>
                {order.name}
                <div className="studio-muted">{order.email}</div>
              </td>
              <td>
                <span className={`studio-status is-${order.status}`}>{order.status}</span>
              </td>
              <td>${Number(order.total).toFixed(2)}</td>
              <td>{order.created_at?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
