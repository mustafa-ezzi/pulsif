import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./register";
import { useLabStore } from "../store/labStore";

export function MotionProvider({ children }) {
  const lenisEnabled = useLabStore((state) => state.lenisEnabled);
  const forceReducedMotion = useLabStore((state) => state.forceReducedMotion);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 800px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!lenisEnabled || !desktop || reduced || forceReducedMotion) {
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [lenisEnabled, forceReducedMotion]);

  return children;
}
