import { gsap } from './motion.js';

/**
 * Draw-on for the hand-drawn marks. Each is a PNG of one pen stroke; wiping a
 * clip-path across it in the direction it was drawn reads as the mark being
 * made now. CSS shows them in full — this only sets the "from" state.
 */

// Which edge the stroke grows from. Both values of each pair are full inset()
// shorthands, so GSAP interpolates one number and leaves the rest alone.
const WIPES = {
  left: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
  right: ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'],
  up: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
  down: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
};

export function initScribble() {
  const marks = document.querySelectorAll('[data-scribble]');
  if (!marks.length) return;

  marks.forEach((mark) => {
    const [from, to] = WIPES[mark.dataset.scribble] ?? WIPES.left;

    gsap.fromTo(
      mark,
      { clipPath: from },
      {
        clipPath: to,
        duration: 0.5,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: mark,
          start: 'top 85%',
          once: true,
        },
      },
    );
  });
}
