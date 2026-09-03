import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export function NotFoundPage() {
  usePageTitle("Not found");

  return (
    <section className="page">
      <p className="eyebrow">404</p>
      <h1 className="display page__title">This page has left the floor</h1>
      <Link className="text-link" to="/">
        Home →
      </Link>
    </section>
  );
}
