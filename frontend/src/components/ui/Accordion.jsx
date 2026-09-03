import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Plus } from "lucide-react";
import { gsap } from "../../motion/register";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      const el = bodyRef.current;
      if (!el) return;
      if (reduce) {
        gsap.set(el, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0 });
        return;
      }
      if (open) {
        gsap.to(el, { height: "auto", autoAlpha: 1, duration: 0.35, ease: "power2.out" });
      } else {
        gsap.to(el, { height: 0, autoAlpha: 0, duration: 0.35, ease: "power2.out" });
      }
    },
    { dependencies: [open, reduce] }
  );

  return (
    <div className={open ? "accordion is-open" : "accordion"}>
      <button type="button" className="accordion__trigger" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>{title}</span>
        <Plus size={16} className="accordion__icon" />
      </button>
      <div ref={bodyRef} className="accordion__body">
        <div className="accordion__inner">{children}</div>
      </div>
    </div>
  );
}
