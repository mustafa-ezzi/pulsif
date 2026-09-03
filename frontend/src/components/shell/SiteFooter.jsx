import { Link } from "react-router-dom";
import { NewsletterField } from "../form/NewsletterField";
import { useUiStore } from "../../store/uiStore";

const HELP = [
  { label: "Search", action: "search" },
  { to: "/contact", label: "Contact" },
  { to: "/faqs", label: "FAQs" },
  { to: "/privacy", label: "Your Privacy Choices" },
];

const LEGAL = [
  { to: "/privacy", label: "Privacy policy" },
  { to: "/refund", label: "Refund policy" },
  { to: "/terms", label: "Terms of service" },
  { to: "/shipping", label: "Shipping policy" },
  { to: "/contact", label: "Contact information" },
];

export function SiteFooter() {
  const openSearch = useUiStore((state) => state.openSearch);

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="eyebrow">Help and Information</p>
          <ul className="site-footer__links">
            {HELP.map((item) => (
              <li key={item.label}>
                {item.action === "search" ? (
                  <button type="button" onClick={openSearch}>
                    {item.label}
                  </button>
                ) : (
                  <Link to={item.to}>{item.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__brand">
          <p className="site-logo">Pulsif</p>
          <p className="eyebrow">Sign up for our newsletter</p>
          <NewsletterField />
        </div>

        <div>
          <p className="eyebrow">Terms and Policies</p>
          <ul className="site-footer__links">
            {LEGAL.map((item) => (
              <li key={item.to + item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <div className="site-footer__social">
            <a href="https://instagram.com" rel="noreferrer" target="_blank">
              Instagram
            </a>
            <a href="https://facebook.com" rel="noreferrer" target="_blank">
              Facebook
            </a>
          </div>
        </div>
      </div>
      <p className="site-footer__copy">© {new Date().getFullYear()} Pulsif</p>
    </footer>
  );
}
