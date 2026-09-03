import { useEffect } from "react";

const DEFAULT_DESCRIPTION =
  "Pulsif — pilates boards, bands, and lifting grips. Shop the floor.";

export function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — Pulsif` : "Pulsif";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description || DEFAULT_DESCRIPTION);
  }, [title, description]);
}
