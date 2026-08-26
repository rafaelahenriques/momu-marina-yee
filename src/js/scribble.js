import { gsap } from './motion.js';

/**
 * Draw-on for the hand-drawn marks.
 *
 * Each mark is a PNG of a single pen stroke. Wiping a clip-path across it in
 * the direction the stroke was drawn reads as the mark being drawn now,
 * which is all this needs to do — the alternative (inline SVG plus
 * DrawSVGPlugin) would mean re-authoring nine images as paths for a result
 * nobody could tell apart.
 *
 * The marks are plain, fully visible images in CSS. This only sets their
 * "from" state at runtime, so if the module never loads, every scribble is
 * simply there, drawn.
 */

// Which edge the stroke grows from. Both values of each pair are written as
// full inset() shorthands so GSAP interpolates one number and leaves the
// rest alone.
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
      }
    );
  });
}
