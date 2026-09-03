import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAccountOrders, loginShopper, registerShopper } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { usePageTitle } from "../hooks/usePageTitle";

export function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  usePageTitle("Account");

  const { data: orders = [] } = useQuery({
    queryKey: ["account-orders", user?.email],
    queryFn: getAccountOrders,
    enabled: Boolean(user),
    retry: 1,
  });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "");
    try {
      const data =
        mode === "login"
          ? await loginShopper(email, password)
          : await registerShopper({ email, password, name });
      setSession(data.access, data.user);
    } catch (err) {
      setError(err.message || "Could not sign in.");
    }
  };

  if (user) {
    return (
      <section className="page page--narrow">
        <p className="eyebrow">Account</p>
        <h1 className="display page__title">{user.name || "Your floor"}</h1>
        <p className="page__lede">{user.email}</p>
        <button className="text-link" type="button" onClick={logout}>
          Log out
        </button>
        <div className="account-orders">
          <p className="eyebrow">Orders</p>
          {orders.length === 0 ? (
            <p className="page__lede">No orders yet. The first paid bag will land here.</p>
          ) : (
            <ul className="catalog-list">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link to={`/order/${order.number}?email=${encodeURIComponent(order.email)}`}>
                    <span>
                      {order.number}
                      <em className="account-order-meta">
                        {" "}
                        {order.status} · {order.lines.length} line{order.lines.length === 1 ? "" : "s"}
                      </em>
                    </span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="page page--narrow">
      <p className="eyebrow">Account</p>
      <h1 className="display page__title">{mode === "login" ? "Log in" : "Create account"}</h1>
      <p className="page__lede">
        Guest checkout still works. An account keeps order history on this machine and the next.
      </p>
      <form className="contact-form" onSubmit={submit}>
        {mode === "register" ? (
          <label>
            Name
            <input name="name" required autoComplete="name" />
          </label>
        ) : null}
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="cta-volt neu-btn" type="submit">
          {mode === "login" ? "Log in" : "Register"}
        </button>
      </form>
      <button
        type="button"
        className="text-link"
        style={{ marginTop: 20 }}
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Need an account?" : "Already have an account?"}
      </button>
    </section>
  );
}
