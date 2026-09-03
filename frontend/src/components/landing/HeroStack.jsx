import { useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../../motion/register";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function HeroStack({ chapters }) {
  const rootRef = useRef(null);
  const reduce = useReducedMotion();
  const signature = (chapters || []).map((chapter) => chapter.id || chapter.headline).join("|");

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !chapters?.length) return undefined;
      const nodes = gsap.utils.toArray(".hero-chapter", root);
      let alive = true;
      document.fonts?.ready.then(() => {
        if (alive && rootRef.current) ScrollTrigger.refresh();
      });

      const mm = gsap.matchMedia();

      const revert = () => {
        alive = false;
        mm.revert();
        ScrollTrigger.getAll().forEach((trigger) => {
          const pin = trigger.vars?.pin;
          const pinned = typeof pin === "string" || pin === true ? trigger.pin : pin;
          if (
            root.contains(trigger.trigger) ||
            (pinned && pinned.nodeType && root.contains(pinned))
          ) {
            trigger.kill(true);
          }
        });
      };

      if (reduce) {
        gsap.set(".hero-media", { scale: 1 });
        gsap.set(".hero-line, .hero-cta", { autoAlpha: 1, y: 0 });
        return revert;
      }

      mm.add("(max-width: 799px)", () => {
        nodes.forEach((chapter) => {
          gsap.from(chapter.querySelectorAll(".hero-line, .hero-cta"), {
            y: 28,
            autoAlpha: 0,
            stagger: 0.08,
            duration: 0.7,
            scrollTrigger: {
              trigger: chapter,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });

      mm.add("(min-width: 800px)", () => {
        nodes.forEach((chapter, index) => {
          const pin = chapter.querySelector(".hero-chapter__pin");
          const media = chapter.querySelector(".hero-media");
          const overlay = chapter.querySelector(".hero-overlay");
          const copy = chapter.querySelectorAll(".hero-line, .hero-cta");

          gsap.fromTo(
            media,
            { scale: 1.08 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: chapter,
                pin,
                pinSpacing: true,
                anticipatePin: 1,
                start: "top top",
                end: "+=100%",
                scrub: 0.8,
                snap: {
                  snapTo: 1,
                  duration: 0.3,
                  delay: 0.18,
                  ease: "power1.inOut",
                },
                invalidateOnRefresh: true,
                refreshPriority: index,
              },
            }
          );

          gsap.fromTo(
            overlay,
            { autoAlpha: 0.42 },
            {
              autoAlpha: 0.78,
              ease: "none",
              scrollTrigger: {
                trigger: chapter,
                start: "top top",
                end: "+=100%",
                scrub: 0.8,
              },
            }
          );

          gsap.from(copy, {
            y: 40,
            autoAlpha: 0,
            stagger: 0.08,
            scrollTrigger: {
              trigger: chapter,
              start: "top 80%",
              toggleActions: "play reverse play reverse",
            },
          });
        });
      });

      return revert;
    },
    { scope: rootRef, dependencies: [signature, reduce], revertOnUpdate: true }
  );

  if (!chapters?.length) return null;

  return (
    <div ref={rootRef} className="hero-stack">
      {chapters.map((chapter, index) => {
        const lines = chapter.lines?.length ? chapter.lines : [chapter.headline];
        return (
          <section key={chapter.id || chapter.headline} className="hero-chapter" aria-label={chapter.eyebrow}>
            <div className="hero-chapter__pin">
              <div
                className={chapter.image ? "hero-media has-image" : "hero-media"}
                data-tone={chapter.tone}
              >
                {chapter.image ? (
                  <img
                    className="hero-media__photo"
                    src={chapter.image}
                    alt=""
                    fetchPriority={index === 0 ? "high" : "low"}
                    decoding="async"
                  />
                ) : (
                  <div className="hero-board" aria-hidden="true" />
                )}
              </div>
              <div className="hero-overlay" />
              <div className="hero-copy">
                <p className="eyebrow hero-line">{chapter.eyebrow}</p>
                <h1 className="display">
                  {lines.map((line) => (
                    <span key={line} className="hero-line" style={{ display: "block" }}>
                      {line}
                    </span>
                  ))}
                </h1>
                {chapter.cta_label ? (
                  <Link className="text-link hero-cta" to={chapter.cta_href || "/catalog"}>
                    {chapter.cta_label} →
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
