import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginStaff } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { usePageTitle } from "../hooks/usePageTitle";

export function StudioLogin() {
  usePageTitle("Studio login");
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [username, setUsername] = useState("studio");
  const [password, setPassword] = useState("studio-dev");
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const data = await loginStaff(username, password);
      setSession(data.access, data.user);
      const next = location.state?.from?.pathname || "/studio";
      navigate(next, { replace: true });
    } catch (err) {
      setError("Staff login failed. Seed the API if this is a fresh machine.");
    }
  };

  return (
    <section className="studio-login">
      <p className="eyebrow">Staff</p>
      <h1 className="display">Studio</h1>
      <p className="page__lede">Add products, move orders, and swap home heroes without a deploy.</p>
      <form className="contact-form" onSubmit={onSubmit}>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="studio-error">{error}</p> : null}
        <button className="cta-volt neu-btn" type="submit">
          Log in
        </button>
      </form>
    </section>
  );
}
