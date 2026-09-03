import { usePageTitle } from "../hooks/usePageTitle";

const COPY = {
  privacy: {
    title: "Privacy policy",
    lede: "How Pulsif handles the details you leave on the floor.",
    sections: [
      {
        heading: "What we collect",
        body: "Account email and name if you register. Cart and order details needed to pack a bag. Contact-form messages. Newsletter addresses you type in. Payment is handled by Stripe — we do not store card numbers.",
      },
      {
        heading: "How we use it",
        body: "To fulfill orders, send receipts and shipping notes, reply to client services, and improve the storefront. We do not sell personal data.",
      },
      {
        heading: "Cookies and storage",
        body: "We keep a cart id and login token in your browser so the bag and Studio session survive a refresh. You can clear site data anytime.",
      },
      {
        heading: "Contact",
        body: "Questions about this policy: hello@pulsif.store.",
      },
    ],
  },
  refund: {
    title: "Refund policy",
    lede: "Unused kit, original condition, within 30 days of delivery.",
    sections: [
      {
        heading: "Returns",
        body: "Boards, bands, grips, and socks may be returned unused, with tags and packaging, within 30 days of the delivery date. We refund the product price to the original payment method.",
      },
      {
        heading: "Final sale",
        body: "Custom or made-to-order pieces, opened hygiene items, and sale goods marked final sale cannot be returned.",
      },
      {
        heading: "How to start",
        body: "Write hello@pulsif.store with your order number. We will send a return label or a drop-off note. Return shipping is on us if we sent the wrong item or it arrived damaged.",
      },
    ],
  },
  terms: {
    title: "Terms of service",
    lede: "Using pulsif.store, checkout, and Studio.",
    sections: [
      {
        heading: "The store",
        body: "Pulsif sells gym and pilates accessories. Product photos and copy on this site are ours. Prices and stock can change before you pay.",
      },
      {
        heading: "Accounts",
        body: "You are responsible for the email and password you use. Studio is for staff only. Do not scrape, overload, or break into the service.",
      },
      {
        heading: "Orders",
        body: "An order is accepted when payment clears. We may cancel and refund if an item cannot ship. Local law still applies where you live.",
      },
    ],
  },
  shipping: {
    title: "Shipping policy",
    lede: "Dispatch windows, tracking, and duties.",
    sections: [
      {
        heading: "Processing",
        body: "In-stock orders leave the studio in 1–3 business days. You receive a tracking number when the bag is handed to the carrier.",
      },
      {
        heading: "Rates",
        body: "Shipping is calculated at checkout. Orders over the free-shipping threshold in Studio settings ship at no extra charge.",
      },
      {
        heading: "International",
        body: "Duties, VAT, and broker fees are the recipient’s responsibility unless we state otherwise on the product page.",
      },
    ],
  },
};

export function LegalPage({ kind }) {
  const page = COPY[kind];
  usePageTitle(page.title, page.lede);

  return (
    <section className="page page--narrow page--paper">
      <p className="eyebrow">Terms and Policies</p>
      <h1 className="display page__title">{page.title}</h1>
      <p className="page__lede">{page.lede}</p>
      {page.sections.map((section) => (
        <article key={section.heading} className="legal-block">
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </article>
      ))}
    </section>
  );
}
