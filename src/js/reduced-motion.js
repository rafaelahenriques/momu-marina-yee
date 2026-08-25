/**
 * Kept in its own module deliberately: main.js needs this check before
 * deciding whether to load GSAP, so it must not sit in a file that imports
 * GSAP — that would pull the whole library into the initial bundle and
 * defeat the dynamic import.
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
