import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useUiStore } from "../../store/uiStore";
import { QtyStepper } from "../ui/QtyStepper";
import { DrawerFrame } from "./DrawerFrame";

function LineMeta({ line }) {
  return [line.color, line.size].filter(Boolean).join(" / ");
}

export function CartDrawer() {
  const open = useUiStore((state) => state.cartOpen);
  const closeAll = useUiStore((state) => state.closeAll);
  const lines = useCartStore((state) => state.lines);
  const setQty = useCartStore((state) => state.setQty);
  const removeLine = useCartStore((state) => state.removeLine);
  const subtotal = lines.reduce((sum, line) => sum + Number(line.price) * line.qty, 0);

  return (
    <DrawerFrame open={open} onClose={closeAll} titleId="cart-title">
      {lines.length === 0 ? (
        <>
          <h2 id="cart-title" className="display site-drawer__title">
            Your cart is empty
          </h2>
          <p className="site-drawer__lede">
            Have an account? <Link to="/account" onClick={closeAll}>Log in</Link> to check out faster.
          </p>
          <Link className="cta-volt neu-btn" to="/catalog" onClick={closeAll}>
            Continue shopping
          </Link>
        </>
      ) : (
        <>
          <h2 id="cart-title" className="display site-drawer__title">
            Your cart
          </h2>
          <ul className="cart-lines">
            {lines.map((line) => (
              <li key={line.id} className="cart-line">
                {line.image ? <img className="cart-line__thumb" src={line.image} alt="" /> : <div className="cart-line__thumb" />}
                <div>
                  <Link to={`/product/${line.productId}`} onClick={closeAll}>
                    {line.title}
                  </Link>
                  <p className="cart-line__meta">{LineMeta({ line })}</p>
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
          <Link className="cta-volt neu-btn" to="/checkout" onClick={closeAll}>
            Checkout
          </Link>
          <Link className="text-link" to="/cart" onClick={closeAll} style={{ marginTop: 16 }}>
            View cart →
          </Link>
        </>
      )}
    </DrawerFrame>
  );
}
