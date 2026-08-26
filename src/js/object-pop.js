import { gsap } from './motion.js';

/**
 * The loose workroom objects drop into their CSS resting positions as the
 * section arrives. Played, not scrubbed: a back ease dragged by the scrollbar
 * reads as jitter rather than as a pop.
 */
export function initObjectPop() {
  document.querySelectorAll('[data-object-pop]').forEach((zone) => {
    const objects = zone.querySelectorAll(':scope > *');
    if (!objects.length) return;

    gsap.from(objects, {
      scale: 0.6,
      autoAlpha: 0,
      // Each from its own direction, so they read as dropped onto the table
      // rather than fading up off a grid.
      x: () => gsap.utils.random(-40, 40),
      y: () => gsap.utils.random(20, 70),
      rotate: () => gsap.utils.random(-20, 20),
      duration: 0.55,
      ease: 'back.out(2)',
      stagger: 0.09,
      scrollTrigger: {
        trigger: zone,
        start: 'top 80%',
        once: true,
      },
    });
  });
}
