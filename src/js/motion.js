import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

// Plugins register once, here, before anything uses them. Every module that
// animates imports from this file rather than from 'gsap' directly, so the
// registration can never be missed. Physics2DPlugin covers the scattering
// letters and InertiaPlugin the poke and the throwable corner — both ship
// with GSAP, so nothing here needs a separate physics engine.
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  Draggable,
  InertiaPlugin,
  Physics2DPlugin,
);

// The house ease, set once so a module only names one when it wants
// something else — which makes the exceptions visible as exceptions.
gsap.defaults({ ease: 'power3.out', duration: 0.7 });

// The address bar sliding away used to re-measure all five pinned sections
// mid-scroll, which is what made a phone stutter and jump a section back on
// itself. The viewport has not really changed size.
ScrollTrigger.config({ ignoreMobileResize: true });

// How far behind the scrollbar a scrubbed animation may run, in seconds.
// Shared, because the page only reads as one surface if everything lags by
// the same amount. SCRUB_TIGHT is for anything that must look attached to
// the scroll position itself.
export const SCRUB = 0.8;
export const SCRUB_TIGHT = 0.4;

/**
 * True where there is a real cursor that hovers. Several effects here are
 * built out of cursor velocity or hover, which a touch screen cannot supply.
 * Asking once, in one place, keeps the answer identical everywhere.
 */
export const canHover = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** True on phone-width screens, where pins are shorter and objects smaller. */
export const isNarrow = () =>
  window.matchMedia('(max-width: 47.999rem)').matches;

/**
 * The next frame — or 100ms, whichever arrives first.
 *
 * The timeout is load-bearing: a background tab is never given a frame, so
 * requestAnimationFrame alone would never settle, and because main.js awaits
 * these in order every module after them would stop running. Layout is still
 * calculated in a hidden tab, so the timeout has something real to measure.
 */
export function nextFrame() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    requestAnimationFrame(finish);
    setTimeout(finish, 100);
  });
}

export { gsap, ScrollTrigger, SplitText, Draggable };
