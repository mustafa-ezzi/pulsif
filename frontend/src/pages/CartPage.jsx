import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { QtyStepper } from "../components/ui/QtyStepper";
import { usePageTitle } from "../hooks/usePageTitle";

export function CartPage() {
  usePageTitle("Cart");
  const lines = useCartStore((state) => state.lines);
  const setQty = useCartStore((state) => state.setQty);
  const removeLine = useCartStore((state) => state.removeLine);
  const subtotal = lines.reduce((sum, line) => sum + Number(line.price) * line.qty, 0);

  return (
    <section className="page">
      <p className="eyebrow">Bag</p>
      <h1 className="display page__title">Your cart</h1>
      {lines.length === 0 ? (
        <>
          <p className="page__lede">Your cart is empty. Have an account? Log in to check out faster.</p>
          <Link className="cta-volt neu-btn" to="/catalog">
            Continue shopping
          </Link>
        </>
      ) : (
        <>
          <ul className="cart-lines cart-lines--page">
            {lines.map((line) => (
              <li key={line.id} className="cart-line">
                {line.image ? <img className="cart-line__thumb" src={line.image} alt="" /> : <div className="cart-line__thumb" />}
                <div>
                  <Link to={`/product/${line.productId}`}>{line.title}</Link>
                  <p className="cart-line__meta">
                    {[line.color, line.size].filter(Boolean).join(" / ")}
                  </p>
                  <button type="button" className="text-link" onClick={() => removeLine(line.id)}>
                    Remove
                  </button>
                </div>
                <QtyStepper value={line.qty} onChange={(qty) => setQty(line.id, qty)} />
                <p className="card-price">${(Number(line.price) * line.qty).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <p className="cart-subtotal">
            Subtotal <strong>${subtotal.toFixed(2)}</strong>
          </p>
          <Link className="cta-volt neu-btn" to="/checkout">
            Checkout
          </Link>
        </>
      )}
    </section>
  );
}
