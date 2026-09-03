import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { postNewsletter } from "../../api/client";

export function NewsletterField({ id = "newsletter-email" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!email.includes("@")) return;
    setError("");
    try {
      await postNewsletter(email);
      setStatus("ok");
    } catch (err) {
      setError(err.message || "Could not subscribe.");
    }
  };

  if (status === "ok") {
    return <p className="newsletter__ok">You're on the list.</p>;
  }

  return (
    <>
      <form className="newsletter" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={id}>
          Email
        </label>
        <input
          id={id}
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <button type="submit" className="newsletter__go" aria-label="Sign up">
          <ArrowRight size={18} strokeWidth={1.5} />
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
    </>
  );
}
