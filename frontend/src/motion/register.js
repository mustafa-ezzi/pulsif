import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerMotion() {
  if (registered) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);
  gsap.defaults({ duration: 0.8, ease: "power3.out" });
  registered = true;
}

export { gsap, Flip, ScrollTrigger };
