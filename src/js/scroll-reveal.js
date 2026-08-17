import { gsap } from './motion.js';

/**
 * Reveals every [data-reveal] element as it scrolls into view.
 *
 * This is the ScrollTrigger baseline the brief asks for — one deliberate,
 * repeatable pattern rather than scattered effects. Replace or extend it once
 * you know what your story needs; the point is that the wiring is already here.
 *
 * Note the order of operations: the elements start visible in CSS, and JS sets
 * their "from" state at runtime. If the script fails, nothing is hidden.
 */
export function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  targets.forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%', // when the top of the element hits 85% down the viewport
        once: true, // play once; remove for a replaying reveal
        // markers: true, // uncomment while tuning
      },
    });
  });
}
