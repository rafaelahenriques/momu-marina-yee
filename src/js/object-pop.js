import { gsap } from './motion.js';

/**
 * Objects arriving one after another.
 *
 * Used where the page lays out the loose things from a workroom — cloth,
 * tape, needle and thread. They drop into their CSS resting positions in
 * quick succession as the section arrives, rather than being there all
 * along.
 *
 * Played, not scrubbed: the pop is a back ease, and a back ease dragged
 * frame by frame by the scrollbar reads as jitter rather than as a pop.
 *
 * Every object is already in place in CSS, so this only animates *into*
 * that arrangement — nothing here is needed for the section to look
 * finished.
 */
export function initObjectPop() {
  document.querySelectorAll('[data-object-pop]').forEach((zone) => {
    const objects = zone.querySelectorAll(':scope > *');
    if (!objects.length) return;

    gsap.from(objects, {
      scale: 0.6,
      autoAlpha: 0,
      // Each one comes in from its own direction, so they read as dropped
      // onto the table rather than fading up off a grid.
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
