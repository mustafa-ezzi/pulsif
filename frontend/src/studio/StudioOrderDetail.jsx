import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudioOrder, patchStudioOrderStatus, patchStudioTracking, resendStudioOrderEmail } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";
import { useState } from "react";

export function StudioOrderDetail() {
  const { number } = useParams();
  usePageTitle(number);
  const queryClient = useQueryClient();
  const { data: order, error, isLoading } = useQuery({
    queryKey: ["studio-order", number],
    queryFn: () => getStudioOrder(number),
  });
  const [tracking, setTracking] = useState("");
  const [message, setMessage] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["studio-order", number] });

  if (isLoading) return <p className="studio-page">Loading order…</p>;
  if (error) return <p className="studio-page studio-error">{error.message}</p>;

  const address = order.shipping_address || {};

  const advance = async (status) => {
    setMessage("");
    try {
      await patchStudioOrderStatus(order.number, {
        status,
        tracking_number: tracking || order.tracking_number,
      });
      await refresh();
      queryClient.invalidateQueries({ queryKey: ["studio-orders"] });
      queryClient.invalidateQueries({ queryKey: ["studio-dashboard"] });
    } catch (err) {
      setMessage(err.message || "Could not update status.");
    }
  };

  return (
    <div className="studio-page">
      <p className="eyebrow">
        <Link to="/studio/orders">Orders</Link>
      </p>
      <h1 className="display">{order.number}</h1>
      <p>
        <span className={`studio-status is-${order.status}`}>{order.status}</span>
        <span className="studio-muted"> · {order.email}</span>
      </p>
      {message ? <p className="studio-error">{message}</p> : null}

      <div className="studio-form__row">
        <label>
          Tracking number
          <input
            value={tracking || order.tracking_number || ""}
            onChange={(event) => setTracking(event.target.value)}
            placeholder="Required to ship"
          />
        </label>
        <button
          type="button"
          className="neu-btn"
          onClick={async () => {
            await patchStudioTracking(order.number, tracking || order.tracking_number);
            refresh();
          }}
        >
          Save tracking
        </button>
        <button
          type="button"
          className="neu-btn"
          onClick={async () => {
            await resendStudioOrderEmail(order.number);
            setMessage("Email sent to console.");
          }}
        >
          Resend email
        </button>
      </div>

      <div className="studio-chip-row">
        {(order.next_statuses || []).map((status) => (
          <button key={status} type="button" className="studio-chip on" onClick={() => advance(status)}>
            Mark {status}
          </button>
        ))}
      </div>

      <h2 className="studio-h2">Ship to</h2>
      <p>
        {order.name}
        <br />
        {address.line1} {address.line2}
        <br />
        {address.city} {address.region} {address.postal}
        <br />
        {address.country}
      </p>

      <h2 className="studio-h2">Lines</h2>
      <table className="studio-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {(order.lines || []).map((line, index) => (
            <tr key={`${line.sku}-${index}`}>
              <td>
                {line.title}
                <div className="studio-muted">
                  {line.color} / {line.size}
                </div>
              </td>
              <td>{line.sku}</td>
              <td>{line.qty}</td>
              <td>${Number(line.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Shipping ${Number(order.shipping).toFixed(2)} · Total ${Number(order.total).toFixed(2)}
      </p>
    </div>
  );
}
