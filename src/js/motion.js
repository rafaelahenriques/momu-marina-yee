import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP plugins have to be registered once, before anything uses them.
// Doing it here means every other module can just `import { gsap }` from this file
// and know ScrollTrigger is ready.
gsap.registerPlugin(ScrollTrigger);

/**
 * True when the visitor has asked their operating system to reduce motion.
 * Read it at call time rather than caching it, so the page reacts if the
 * setting changes mid-session.
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger };
