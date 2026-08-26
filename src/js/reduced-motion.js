// Its own module on purpose: main.js needs this before deciding whether to
// load GSAP, so it must not live in a file that imports GSAP — that would pull
// the library into the initial bundle and defeat the dynamic import.
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
