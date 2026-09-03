import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export function RouteErrorPage() {
  const error = useRouteError();
  usePageTitle("Error");
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <section className="page">
      <p className="eyebrow">Error</p>
      <h1 className="display page__title">The floor hit a snag</h1>
      <p className="page__lede">{message}</p>
      <button className="cta-volt neu-btn" type="button" onClick={() => window.location.reload()}>
        Reload
      </button>
      <p style={{ marginTop: 20 }}>
        <Link className="text-link" to="/">
          Home →
        </Link>
      </p>
    </section>
  );
}
