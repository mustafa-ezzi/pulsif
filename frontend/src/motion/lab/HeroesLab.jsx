import { useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../register";
import { HERO_CHAPTERS } from "../../data/labProducts";
import { useLabStore } from "../../store/labStore";

export function HeroesLab() {
  const rootRef = useRef(null);
  const heroMode = useLabStore((state) => state.heroMode);
  const forceReducedMotion = useLabStore((state) => state.forceReducedMotion);
  const showMarkers = useLabStore((state) => state.showMarkers);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const chapters = gsap.utils.toArray(".hero-chapter");
      const reduce =
        forceReducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      document.fonts?.ready.then(() => {
        if (rootRef.current) ScrollTrigger.refresh();
      });

      const mm = gsap.matchMedia();

      if (reduce) {
        gsap.set(".hero-media", { scale: 1 });
        gsap.set(".hero-line, .hero-cta", { autoAlpha: 1, y: 0 });
        return () => mm.revert();
      }

      mm.add("(max-width: 799px)", () => {
        chapters.forEach((chapter) => {
          const copy = chapter.querySelectorAll(".hero-line, .hero-cta");
          gsap.from(copy, {
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
        if (heroMode === "fade-up") {
          chapters.forEach((chapter) => {
            const copy = chapter.querySelectorAll(".hero-line, .hero-cta");
            gsap.from(copy, {
              y: 40,
              autoAlpha: 0,
              stagger: 0.08,
              scrollTrigger: {
                trigger: chapter,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            });
          });
          return;
        }

        chapters.forEach((chapter, index) => {
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
                start: "top top",
                end: "+=100%",
                pin: true,
                scrub: 0.8,
                snap: {
                  snapTo: 1,
                  duration: 0.3,
                  delay: 0.18,
                  ease: "power1.inOut",
                },
                markers: showMarkers,
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

      return () => mm.revert();
    },
    {
      scope: rootRef,
      dependencies: [heroMode, forceReducedMotion, showMarkers],
      revertOnUpdate: true,
    }
  );

  return (
    <div ref={rootRef} className="hero-stack">
      {HERO_CHAPTERS.map((chapter) => (
        <section key={chapter.id} className="hero-chapter" aria-label={chapter.eyebrow}>
          <div className="hero-media" data-tone={chapter.tone}>
            <div className="hero-board" aria-hidden="true" />
          </div>
          <div className="hero-overlay" />
          <div className="hero-copy">
            <p className="eyebrow hero-line">{chapter.eyebrow}</p>
            <h1 className="display">
              {chapter.lines.map((line) => (
                <span key={line} className="hero-line" style={{ display: "block" }}>
                  {line}
                </span>
              ))}
            </h1>
            <Link className="text-link hero-cta" to="/lab/cards">
              {chapter.cta} →
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
