import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export function StudioStub() {
  usePageTitle("Studio");

  return (
    <section className="page">
      <p className="eyebrow">Staff</p>
      <h1 className="display page__title">Studio</h1>
      <p className="page__lede">
        Dashboard, product CRUD, orders, and carousel uploads land in Phase 5.
      </p>
      <Link className="text-link" to="/">
        Back to store →
      </Link>
    </section>
  );
}
