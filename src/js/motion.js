import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

// Plugins register once, here, before anything uses them. Every module that
// animates imports from this file rather than from 'gsap' directly, so the
// registration can never be missed.
//
// Physics2DPlugin covers the scattering letters and InertiaPlugin the poke
// and the throwable corner — both ship with GSAP, so nothing on this page
// needs a separate physics engine loaded alongside it.
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  Draggable,
  InertiaPlugin,
  Physics2DPlugin
);

/*
 * One motion character for the whole page, set once.
 *
 * power3.out is the shape everything on this page settles with: quick to
 * commit, long to come to rest. Declaring it as the default means a module
 * only names an ease when it wants something other than the house style,
 * which makes the exceptions (the physics arcs, the linear scrubs) visible
 * as exceptions.
 */
gsap.defaults({ ease: 'power3.out', duration: 0.7 });

/*
 * Mobile browsers grow and shrink the viewport as the address bar slides
 * away, and every one of those resizes used to re-measure all five pinned
 * sections mid-scroll — which is what made a phone stutter and jump a
 * section back on itself. The viewport has not really changed size, so the
 * measurements should not be thrown away.
 */
ScrollTrigger.config({ ignoreMobileResize: true });

/*
 * How far behind the scrollbar a scrubbed animation is allowed to run, in
 * seconds. Shared rather than picked per module: the page reads as one
 * surface only if everything on it lags by the same amount.
 *
 * SCRUB_TIGHT is for anything that has to look attached to the scroll
 * position itself — a line uncovering, a bar filling. SCRUB is for
 * everything that is drifting rather than tracking.
 */
export const SCRUB = 0.8;
export const SCRUB_TIGHT = 0.4;

/**
 * True where there is a real cursor that hovers.
 *
 * Several effects here are built out of cursor velocity or hover, which a
 * touch screen cannot supply. Asking this once, in one place, keeps the
 * answer identical everywhere — and keeps the touch branch a deliberate
 * design decision rather than an accident of whichever media query a
 * module happened to write.
 */
export const canHover = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** True on phone-width screens, where pins are shorter and objects smaller. */
export const isNarrow = () => window.matchMedia('(max-width: 47.999rem)').matches;

/**
 * The next frame — or 100ms, whichever arrives first.
 *
 * Two of the pinned sections re-lay their text out and then have to measure
 * the result, which means waiting a frame before splitting it.
 * requestAnimationFrame on its own is not enough for that: a page opened in
 * a background tab is never given a frame, so the promise never settles,
 * and because main.js awaits these in order, *every module after them stops
 * running too* — no horizontal scroll, no scribbles, no final refresh. The
 * sections have already taken their `.is-enhanced` class by then, so the
 * page is left reserving several screens of scroll for animations that were
 * never built.
 *
 * The timeout is the way out. Layout is still calculated in a hidden tab
 * even though nothing is painted, so there is something real to measure
 * whenever this resolves.
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
