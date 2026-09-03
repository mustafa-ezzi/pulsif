import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

function PayForm({ onPaid, returnUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setPending(true);
    setError("");
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });
    if (stripeError) {
      setError(stripeError.message);
      setPending(false);
      return;
    }
    try {
      await onPaid();
    } catch (err) {
      setError(err.message || "Payment captured, but the order did not confirm.");
      setPending(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <PaymentElement />
      {error ? <p className="form-error">{error}</p> : null}
      <button className="cta-volt neu-btn" type="submit" disabled={!stripe || pending}>
        {pending ? "Paying…" : "Pay now"}
      </button>
    </form>
  );
}

export function StripePay({ publishableKey, clientSecret, returnUrl, onPaid }) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe", variables: { colorPrimary: "#14161a" } },
      }}
    >
      <PayForm onPaid={onPaid} returnUrl={returnUrl} />
    </Elements>
  );
}
