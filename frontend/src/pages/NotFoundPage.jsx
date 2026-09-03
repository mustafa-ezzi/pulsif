import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export function NotFoundPage() {
  usePageTitle("Not found");

  return (
    <section className="page">
      <p className="eyebrow">404</p>
      <h1 className="display page__title">This page has left the floor</h1>
      <p className="page__lede">That URL is not on the floor. Head home or open the catalog.</p>
      <p>
        <Link className="text-link" to="/">
          Home →
        </Link>
      </p>
      <p style={{ marginTop: 12 }}>
        <Link className="text-link" to="/catalog">
          Catalog →
        </Link>
      </p>
    </section>
  );
}
