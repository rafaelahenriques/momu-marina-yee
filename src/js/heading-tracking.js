import { gsap } from './motion.js';

/**
 * Letter-spacing pull-apart on "One Corner Off".
 *
 * Default state in CSS is normal tracking — exactly what no-JS and
 * reduced-motion visitors read, no different from any other heading. This
 * only widens the spacing as the section scrolls through view, echoing the
 * phrase itself: something whole, deliberately disturbed.
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
        scrub: 0.6,
      },
    }
  );
}