import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getContact, postContact } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";

export function ContactPage() {
  usePageTitle("Contact");
  const { data } = useQuery({
    queryKey: ["contact"],
    queryFn: getContact,
    retry: 1,
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await postContact({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send. Try again.");
    }
  };

  return (
    <section className="page">
      <p className="eyebrow">Client services</p>
      <h1 className="display page__title">Get in touch</h1>
      <p className="page__lede">
        {data?.blurb ||
          "Sizing, orders, or a pilates board in pink, purple, or black — a real person will write back."}
      </p>

      <div className="contact-cards">
        <article className="lab-tile">
          <p className="eyebrow">Phone</p>
          <h2>{data?.phone || "+1 (000) 000-0000"}</h2>
          <p>{data?.phone_hours || "Mon - Fri, 9:00 - 18:00"}</p>
        </article>
        <article className="lab-tile">
          <p className="eyebrow">Email</p>
          <h2>{data?.email || "hello@pulsif.store"}</h2>
          <p>{data?.email_note || "Within one business day"}</p>
        </article>
        <article className="lab-tile">
          <p className="eyebrow">Studio</p>
          <h2>{data?.address || "Address coming soon"}</h2>
          <p>{data?.address_hours || "Tue - Sat, 10:00 - 19:00"}</p>
        </article>
      </div>

      <div className="paper-panel">
        {sent ? (
          <p>Message received. We'll reply to the address you left.</p>
        ) : (
          <form className="contact-form" onSubmit={submit}>
            <label>
              Name
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Message
              <textarea name="message" rows={4} required />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="cta-volt neu-btn" type="submit">
              Send
            </button>
          </form>
        )}
        <p className="page__lede" style={{ marginTop: 24 }}>
          Need a quicker answer? <Link to="/faqs">Read the FAQs</Link>.
        </p>
      </div>
    </section>
  );
}
