import { gsap, SCRUB } from './motion.js';

/**
 * Letter-spacing pull-apart on "One Corner Off". It starts at the tight
 * tracking every chapter title has and only widens as the section scrolls
 * through view. Kept small: at poster size each hundredth of an em is a
 * visible gap, and much more would push the title onto a second line
 * mid-scroll.
 */
export function initHeadingTracking() {
  const heading = document.querySelector('[data-tracking-heading] span');
  if (!heading) return;

  gsap.fromTo(
    heading,
    { letterSpacing: '-0.02em' },
    {
      letterSpacing: '0.06em',
      ease: 'none',
      scrollTrigger: {
        trigger: heading,
        start: 'top 75%',
        end: 'top 20%',
        scrub: SCRUB,
      },
    },
  );
}
