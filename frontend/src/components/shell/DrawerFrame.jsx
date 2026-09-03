import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLockBody } from "../../hooks/useLockBody";

export function DrawerFrame({
  open,
  onClose,
  titleId,
  labelledBy,
  children,
}) {
  const closeRef = useRef(null);

  useLockBody(open);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (!open) return undefined;
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={open ? "site-drawer is-open" : "site-drawer"} aria-hidden={!open}>
      <button
        className="site-drawer__backdrop"
        type="button"
        aria-label="Close"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside
        className="site-drawer__panel"
        role="dialog"
        aria-modal={open}
        aria-labelledby={labelledBy || titleId}
      >
        <button
          className="site-icon-btn site-drawer__close"
          type="button"
          aria-label="Close"
          ref={closeRef}
          onClick={onClose}
          tabIndex={open ? 0 : -1}
        >
          <X size={18} strokeWidth={1.5} />
        </button>
        {children}
      </aside>
    </div>,
    document.body
  );
}
