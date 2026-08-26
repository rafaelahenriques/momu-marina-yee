import { gsap, SCRUB } from './motion.js';

/**
 * Letter-spacing pull-apart on "One Corner Off". Default tracking is normal;
 * this only widens it as the section scrolls through view.
 */
export function initHeadingTracking() {
  const heading = document.querySelector('[data-tracking-heading] span');
  if (!heading) return;

  gsap.fromTo(
    heading,
    { letterSpacing: '0em' },
    {
      letterSpacing: '0.15em',
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
