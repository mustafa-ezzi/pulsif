import { useState } from "react";

export function MockPay({ email, onPaid }) {
  const [card, setCard] = useState("4242424242424242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const digits = card.replace(/\s/g, "");
    if (digits !== "4242424242424242") {
      setError("Use test card 4242 4242 4242 4242.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry) || cvc.replace(/\D/g, "").length < 3) {
      setError("Add a future expiry and a 3-digit CVC.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await onPaid({ card: digits, email });
    } catch (err) {
      setError(err.message || "Payment failed.");
      setPending(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <p className="page__lede">
        Stripe keys are not set, so this is test-mode mock pay. Card{" "}
        <strong>4242 4242 4242 4242</strong> completes the order.
      </p>
      <label>
        Card number
        <input
          inputMode="numeric"
          autoComplete="cc-number"
          value={card}
          onChange={(event) => setCard(event.target.value)}
        />
      </label>
      <div className="checkout-card-row">
        <label>
          Expiry
          <input
            placeholder="MM/YY"
            autoComplete="cc-exp"
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
          />
        </label>
        <label>
          CVC
          <input
            inputMode="numeric"
            autoComplete="cc-csc"
            value={cvc}
            onChange={(event) => setCvc(event.target.value)}
          />
        </label>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="cta-volt neu-btn" type="submit" disabled={pending}>
        {pending ? "Paying…" : "Pay now"}
      </button>
    </form>
  );
}
