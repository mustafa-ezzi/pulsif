import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { confirmCheckout, createCheckout, registerShopper } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { usePageTitle } from "../hooks/usePageTitle";
import { StripePay } from "../components/checkout/StripePay";
import { MockPay } from "../components/checkout/MockPay";

const STEPS = ["Details", "Shipping", "Pay"];
const LAST_ORDER = "pulsif_last_order";

export function CheckoutPage() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const lines = useCartStore((state) => state.lines);
  const hydrate = useCartStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const subtotal = lines.reduce((sum, line) => sum + Number(line.price) * line.qty, 0);

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState({
    email: user?.email || "",
    name: user?.name || "",
    password: "",
  });
  const [shipping, setShipping] = useState({
    line1: "",
    line2: "",
    city: "",
    region: "",
    postal: "",
    country: "US",
  });

  const returnUrl = useMemo(() => {
    if (!order) return `${window.location.origin}/checkout`;
    return `${window.location.origin}/order/${order.number}?email=${encodeURIComponent(details.email)}`;
  }, [order, details.email]);

  const setField = (bag, setter) => (event) => {
    setter((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const goShipping = async (event) => {
    event.preventDefault();
    setError("");
    if (details.password) {
      try {
        const data = await registerShopper({
          email: details.email,
          password: details.password,
          name: details.name,
        });
        setSession(data.access, data.user);
      } catch (err) {
        if (!String(err.message || "").toLowerCase().includes("already")) {
          setError(err.message);
          return;
        }
      }
    }
    setStep(1);
  };

  const goPay = async (event) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const created = await createCheckout({
        email: details.email,
        name: details.name,
        shipping,
      });
      setOrder(created);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  const finish = async (extra = {}) => {
    const paid = await confirmCheckout(order.id, { email: details.email, ...extra });
    sessionStorage.setItem(LAST_ORDER, JSON.stringify({ number: paid.number, email: paid.email }));
    await hydrate();
    navigate(`/order/${paid.number}?email=${encodeURIComponent(paid.email)}`);
  };

  const summaryLines = order?.lines || lines;
  const summarySubtotal = order ? order.subtotal : subtotal;
  const summaryShipping = order ? order.shipping : null;
  const summaryTotal = order ? order.total : subtotal;

  return (
    <section className="page page--paper">
      <p className="eyebrow">Checkout</p>
      <h1 className="display page__title">Secure bag</h1>
      <div className="checkout-steps" aria-hidden="true">
        {STEPS.map((label, index) => (
          <span key={label} className={index === step ? "is-on" : undefined}>
            {label}
          </span>
        ))}
      </div>
      <div className="checkout-progress" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />

      {lines.length === 0 && !order ? (
        <p className="page__lede">
          Nothing to pay yet. <Link to="/catalog">Continue shopping</Link>.
        </p>
      ) : (
        <div className="checkout-grid">
          <div>
            {step === 0 ? (
              <form className="contact-form" onSubmit={goShipping}>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={details.email}
                    onChange={setField(details, setDetails)}
                  />
                </label>
                <label>
                  Full name
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    value={details.name}
                    onChange={setField(details, setDetails)}
                  />
                </label>
                <label>
                  Create account password (optional)
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    value={details.password}
                    onChange={setField(details, setDetails)}
                    placeholder="Leave blank to check out as a guest"
                  />
                </label>
                {error ? <p className="form-error">{error}</p> : null}
                <button className="cta-volt neu-btn" type="submit">
                  Continue to shipping
                </button>
                {!user ? (
                  <p className="page__lede">
                    Already have an account? <Link to="/account">Log in</Link> for faster checkout.
                  </p>
                ) : null}
              </form>
            ) : null}

            {step === 1 ? (
              <form className="contact-form" onSubmit={goPay}>
                <label>
                  Address
                  <input
                    name="line1"
                    required
                    autoComplete="address-line1"
                    value={shipping.line1}
                    onChange={setField(shipping, setShipping)}
                  />
                </label>
                <label>
                  Apt, suite
                  <input
                    name="line2"
                    autoComplete="address-line2"
                    value={shipping.line2}
                    onChange={setField(shipping, setShipping)}
                  />
                </label>
                <label>
                  City
                  <input
                    name="city"
                    required
                    autoComplete="address-level2"
                    value={shipping.city}
                    onChange={setField(shipping, setShipping)}
                  />
                </label>
                <div className="checkout-card-row">
                  <label>
                    Region
                    <input
                      name="region"
                      autoComplete="address-level1"
                      value={shipping.region}
                      onChange={setField(shipping, setShipping)}
                    />
                  </label>
                  <label>
                    Postal
                    <input
                      name="postal"
                      required
                      autoComplete="postal-code"
                      value={shipping.postal}
                      onChange={setField(shipping, setShipping)}
                    />
                  </label>
                </div>
                <label>
                  Country
                  <input
                    name="country"
                    required
                    maxLength={2}
                    autoComplete="country"
                    value={shipping.country}
                    onChange={setField(shipping, setShipping)}
                  />
                </label>
                {error ? <p className="form-error">{error}</p> : null}
                <button className="cta-volt neu-btn" type="submit" disabled={pending}>
                  {pending ? "Preparing payment…" : "Continue to pay"}
                </button>
                <button className="text-link" type="button" onClick={() => setStep(0)}>
                  Back
                </button>
              </form>
            ) : null}

            {step === 2 && order ? (
              <div>
                {order.mock || !order.client_secret ? (
                  <MockPay email={details.email} onPaid={finish} />
                ) : (
                  <StripePay
                    publishableKey={order.publishable_key}
                    clientSecret={order.client_secret}
                    returnUrl={returnUrl}
                    onPaid={() => finish({ email: details.email })}
                  />
                )}
                <button className="text-link" type="button" onClick={() => setStep(1)} style={{ marginTop: 16 }}>
                  Back
                </button>
              </div>
            ) : null}
          </div>

          <aside className="paper-panel checkout-summary">
            <p className="eyebrow">Summary</p>
            <ul className="checkout-summary__lines">
              {summaryLines.map((line) => (
                <li key={line.sku || line.id}>
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
              Subtotal <strong>${Number(summarySubtotal).toFixed(2)}</strong>
            </p>
            <p className="cart-subtotal">
              Shipping{" "}
              <strong>
                {summaryShipping == null
                  ? "Calculated next"
                  : Number(summaryShipping) === 0
                    ? "Free"
                    : `$${Number(summaryShipping).toFixed(2)}`}
              </strong>
            </p>
            <p className="cart-subtotal checkout-total">
              Total <strong>${Number(summaryTotal).toFixed(2)}</strong>
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
