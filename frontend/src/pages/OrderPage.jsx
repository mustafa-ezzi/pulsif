import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";

const LAST_ORDER = "pulsif_last_order";

function storedEmail(number) {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.number === number) return parsed.email || "";
  } catch {
    return "";
  }
  return "";
}

export function OrderPage() {
  const { number } = useParams();
  const [params] = useSearchParams();
  const email = params.get("email") || storedEmail(number);
  usePageTitle(number ? `Order ${number}` : "Order");

  const { data: order, isError, isLoading } = useQuery({
    queryKey: ["order", number, email],
    queryFn: () => getOrder(number, email),
    retry: 1,
    enabled: Boolean(number),
  });

  if (isLoading) {
    return (
      <section className="page page--paper">
        <p className="eyebrow">Order</p>
        <h1 className="display page__title">Looking up the bag</h1>
      </section>
    );
  }

  if (isError || !order) {
    return (
      <section className="page page--paper">
        <p className="eyebrow">Order</p>
        <h1 className="display page__title">We could not find that order</h1>
        <p className="page__lede">If you just paid, wait a moment and reload, or open the link from your email.</p>
        <Link className="text-link" to="/account">
          Account →
        </Link>
      </section>
    );
  }

  const paid = order.status === "paid";

  return (
    <section className="page page--paper">
      <p className="eyebrow">{paid ? "Confirmed" : order.status}</p>
      <h1 className="display page__title">{order.number}</h1>
      <p className="page__lede">
        {paid
          ? `Paid. A note is on its way to ${order.email}.`
          : `We have the order for ${order.email}. Payment is still settling.`}
      </p>
      <div className="paper-panel">
        <p className="eyebrow">Items</p>
        <ul className="checkout-summary__lines">
          {order.lines.map((line) => (
            <li key={line.sku}>
              <span>
                {line.title}
                <em>
                  {line.color} / {line.size} × {line.qty}
                </em>
              </span>
              <strong>${(Number(line.price) * line.qty).toFixed(2)}</strong>
            </li>
          ))}
        </ul>
        <p className="cart-subtotal">
          Shipping <strong>{Number(order.shipping) === 0 ? "Free" : `$${Number(order.shipping).toFixed(2)}`}</strong>
        </p>
        <p className="cart-subtotal checkout-total">
          Total <strong>${Number(order.total).toFixed(2)}</strong>
        </p>
        <p className="page__lede" style={{ marginTop: 20 }}>
          {order.shipping_address.line1}, {order.shipping_address.city} {order.shipping_address.postal}
        </p>
      </div>
      <p style={{ marginTop: 28 }}>
        <Link className="cta-volt neu-btn" to="/catalog">
          Continue shopping
        </Link>
      </p>
    </section>
  );
}
