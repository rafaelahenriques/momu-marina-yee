import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

// Every animating module imports GSAP from this file rather than from 'gsap',
// so the plugins can never be used before this registration runs.
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  Draggable,
  InertiaPlugin,
  Physics2DPlugin,
);

gsap.defaults({ ease: 'power3.out', duration: 0.7 });

// Stops the address bar sliding away from re-measuring all five pinned
// sections mid-scroll, which made phones stutter and jump a section back.
ScrollTrigger.config({ ignoreMobileResize: true });

// How far behind the scrollbar a scrubbed animation may run, in seconds.
// Shared, so the whole page lags by the same amount.
export const SCRUB = 0.8;
export const SCRUB_TIGHT = 0.4;

export const canHover = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isNarrow = () =>
  window.matchMedia('(max-width: 47.999rem)').matches;

/**
 * The next frame, or 100ms, whichever comes first. The timeout is
 * load-bearing: a background tab never gets a frame, so rAF alone would never
 * settle, and main.js awaits these in order — every module after would stall.
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
