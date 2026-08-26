import { gsap } from './motion.js';

/**
 * Reveals [data-reveal] elements as they enter the viewport. They are
 * visible in CSS by default; this sets their "from" state at runtime, so if
 * the module never loads nothing is hidden.
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
        start: 'top 85%',
        once: true,
      },
    });
  });
}
