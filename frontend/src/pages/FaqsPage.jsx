import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFaqs } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";
import { Accordion } from "../components/ui/Accordion";

export function FaqsPage() {
  usePageTitle("FAQs");
  const { data } = useQuery({
    queryKey: ["faqs"],
    queryFn: getFaqs,
    retry: 1,
  });
  const groups = data?.groups || [];

  const scrollTo = (slug) => {
    document.getElementById(`faq-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="page page--narrow">
      <p className="eyebrow">Help</p>
      <h1 className="display page__title">Frequently asked questions</h1>
      {groups.length ? (
        <div className="faq-chips">
          {groups.map((group) => (
            <button key={group.slug} type="button" className="lab-chip" onClick={() => scrollTo(group.slug)}>
              {group.title}
            </button>
          ))}
        </div>
      ) : null}
      {groups.map((group) => (
        <div key={group.slug} id={`faq-${group.slug}`} className="faq-group">
          <p className="eyebrow">{group.title}</p>
          {group.items.map((item) => (
            <Accordion key={item.id} title={item.question}>
              <p>{item.answer}</p>
            </Accordion>
          ))}
        </div>
      ))}
      <div className="paper-panel" style={{ marginTop: 48 }}>
        <p className="eyebrow">Still have questions?</p>
        <h2 className="display" style={{ fontSize: 36, margin: "8px 0 12px" }}>
          Reach the desk
        </h2>
        <Link className="text-link" to="/contact">
          Contact →
        </Link>
      </div>
    </section>
  );
}
