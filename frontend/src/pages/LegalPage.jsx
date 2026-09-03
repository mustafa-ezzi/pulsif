import { usePageTitle } from "../hooks/usePageTitle";

const COPY = {
  privacy: {
    title: "Privacy policy",
    body: "How we handle accounts, carts, and newsletter addresses. Full policy in Phase 6.",
  },
  refund: {
    title: "Refund policy",
    body: "Unused kit, original condition. Custom pieces stay final sale. Full policy in Phase 6.",
  },
  terms: {
    title: "Terms of service",
    body: "Using the storefront, checkout, and studio. Full terms in Phase 6.",
  },
  shipping: {
    title: "Shipping policy",
    body: "Dispatch windows, tracking, and duties. Full policy in Phase 6.",
  },
};

export function LegalPage({ kind }) {
  const page = COPY[kind];
  usePageTitle(page.title);

  return (
    <section className="page page--narrow page--paper">
      <p className="eyebrow">Terms and Policies</p>
      <h1 className="display page__title">{page.title}</h1>
      <p className="page__lede">{page.body}</p>
    </section>
  );
}
