import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudioOrder, patchStudioOrderStatus, patchStudioTracking, resendStudioOrderEmail } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

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
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (order?.tracking_number) setTracking(order.tracking_number);
  }, [order?.tracking_number]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["studio-order", number] });

  if (isLoading) return <p className="studio-page">Loading order…</p>;
  if (error) return <p className="studio-page studio-error">{error.message}</p>;

  const address = order.shipping_address || {};
  const next = order.next_statuses || [];

  const run = async (key, work) => {
    setMessage("");
    setBusy(key);
    try {
      await work();
      await refresh();
      queryClient.invalidateQueries({ queryKey: ["studio-orders"] });
      queryClient.invalidateQueries({ queryKey: ["studio-dashboard"] });
    } catch (err) {
      setMessage(err.message || "Could not update this order.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="studio-page studio-order">
      <p className="eyebrow">
        <Link to="/studio/orders">Orders</Link>
      </p>
      <header className="studio-order__head">
        <div>
          <h1 className="display studio-order__title">{order.number}</h1>
          <p className="studio-order__meta">
            <span className={`studio-status is-${order.status}`}>{order.status}</span>
            <span>{order.email}</span>
            {order.created_at ? <span>{formatDate(order.created_at)}</span> : null}
          </p>
        </div>
        <p className="studio-order__total">
          <span className="eyebrow">Total</span>
          <strong>${Number(order.total).toFixed(2)}</strong>
        </p>
      </header>
      {message ? <p className={message.includes("sent") ? "studio-muted" : "studio-error"}>{message}</p> : null}

      <div className="studio-order__grid">
        <section className="studio-panel">
          <h2>Lines</h2>
          <div className="studio-scroll">
          <table className="studio-table studio-table--tight">
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
                      {[line.color, line.size].filter(Boolean).join(" / ") || "—"}
                    </div>
                  </td>
                  <td>{line.sku}</td>
                  <td>{line.qty}</td>
                  <td>${Number(line.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <dl className="studio-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>${Number(order.subtotal).toFixed(2)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{Number(order.shipping) === 0 ? "Free" : `$${Number(order.shipping).toFixed(2)}`}</dd>
            </div>
            <div className="is-total">
              <dt>Total</dt>
              <dd>${Number(order.total).toFixed(2)}</dd>
            </div>
          </dl>
        </section>

        <div className="studio-order__side">
          <section className="studio-panel">
            <h2>Ship to</h2>
            <address className="studio-address">
              <strong>{order.name}</strong>
              <span>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
              </span>
              <span>
                {[address.city, address.region, address.postal].filter(Boolean).join(" ")}
              </span>
              <span>{address.country}</span>
            </address>
          </section>

          <section className="studio-panel">
            <h2>Fulfillment</h2>
            <label className="studio-field">
              Tracking number
              <input
                value={tracking}
                onChange={(event) => setTracking(event.target.value)}
                placeholder="Required to ship"
              />
            </label>
            <div className="studio-order__actions">
              <button
                type="button"
                className="studio-ghost"
                disabled={busy === "track"}
                onClick={() =>
                  run("track", () => patchStudioTracking(order.number, tracking || order.tracking_number))
                }
              >
                Save tracking
              </button>
              <button
                type="button"
                className="studio-ghost"
                disabled={busy === "email"}
                onClick={() =>
                  run("email", async () => {
                    await resendStudioOrderEmail(order.number);
                    setMessage("Email sent.");
                  })
                }
              >
                Resend email
              </button>
            </div>
            {next.length ? (
              <div className="studio-order__pipeline">
                {next.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={status === "cancelled" || status === "refunded" ? "studio-ghost is-warn" : "cta-volt neu-btn"}
                    disabled={Boolean(busy)}
                    onClick={() =>
                      run(status, () =>
                        patchStudioOrderStatus(order.number, {
                          status,
                          tracking_number: tracking || order.tracking_number,
                        })
                      )
                    }
                  >
                    Mark {status}
                  </button>
                ))}
              </div>
            ) : (
              <p className="studio-muted">No further status moves from here.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
