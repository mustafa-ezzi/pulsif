import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createStudioFaq, deleteStudioFaq, getStudioSettings, patchStudioFaq, patchStudioSettings } from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";

export function StudioSettings() {
  usePageTitle("Settings");
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["studio-settings"],
    queryFn: getStudioSettings,
  });
  const [site, setSite] = useState(null);
  const [contact, setContact] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!data) return;
    setSite(data.site);
    setContact(data.contact);
  }, [data]);

  if (isLoading || !site || !contact) return <p className="studio-page">Loading settings…</p>;
  if (error) return <p className="studio-page studio-error">{error.message}</p>;

  const save = async (event) => {
    event.preventDefault();
    await patchStudioSettings({ site, contact });
    queryClient.invalidateQueries({ queryKey: ["studio-settings"] });
    setMessage("Saved.");
  };

  return (
    <div className="studio-page">
      <p className="eyebrow">Store</p>
      <h1 className="display">Settings</h1>
      {message ? <p className="studio-muted">{message}</p> : null}
      <form className="studio-form" onSubmit={save}>
        <label>
          Announcement bar
          <input value={site.announcement || ""} onChange={(event) => setSite({ ...site, announcement: event.target.value })} />
        </label>
        <label>
          Newsletter blurb
          <input
            value={site.newsletter_blurb || ""}
            onChange={(event) => setSite({ ...site, newsletter_blurb: event.target.value })}
          />
        </label>
        <div className="studio-form__row">
          <label>
            Flat shipping
            <input
              value={site.shipping_flat}
              onChange={(event) => setSite({ ...site, shipping_flat: event.target.value })}
            />
          </label>
          <label>
            Free over
            <input
              value={site.shipping_free_over}
              onChange={(event) => setSite({ ...site, shipping_free_over: event.target.value })}
            />
          </label>
        </div>
        <label>
          Contact blurb
          <textarea rows={3} value={contact.blurb || ""} onChange={(event) => setContact({ ...contact, blurb: event.target.value })} />
        </label>
        <div className="studio-form__row">
          <label>
            Email
            <input value={contact.email || ""} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
          </label>
          <label>
            Phone
            <input value={contact.phone || ""} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
          </label>
        </div>
        <label>
          Address
          <input value={contact.address || ""} onChange={(event) => setContact({ ...contact, address: event.target.value })} />
        </label>
        <button className="cta-volt neu-btn" type="submit">
          Save settings
        </button>
      </form>

      <h2 className="studio-h2">FAQs</h2>
      {(data.faqs || []).map((group) => (
        <section key={group.id} className="studio-slot">
          <p className="eyebrow">{group.title}</p>
          {group.items.map((item) => (
            <FaqRow key={item.id} item={item} onSaved={() => queryClient.invalidateQueries({ queryKey: ["studio-settings"] })} />
          ))}
          <button
            type="button"
            className="studio-chip"
            onClick={async () => {
              await createStudioFaq({
                category: group.id,
                question: "New question",
                answer: "Write the answer.",
                sort: group.items.length,
              });
              queryClient.invalidateQueries({ queryKey: ["studio-settings"] });
            }}
          >
            Add FAQ
          </button>
        </section>
      ))}
    </div>
  );
}

function FaqRow({ item, onSaved }) {
  const [question, setQuestion] = useState(item.question);
  const [answer, setAnswer] = useState(item.answer);

  return (
    <div className="studio-card">
      <label>
        Question
        <input value={question} onChange={(event) => setQuestion(event.target.value)} />
      </label>
      <label>
        Answer
        <textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} />
      </label>
      <div className="studio-chip-row">
        <button
          type="button"
          className="cta-volt neu-btn"
          onClick={async () => {
            await patchStudioFaq(item.id, { question, answer });
            onSaved();
          }}
        >
          Save
        </button>
        <button
          type="button"
          className="text-link"
          onClick={async () => {
            await deleteStudioFaq(item.id);
            onSaved();
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
