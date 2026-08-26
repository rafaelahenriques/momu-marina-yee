import { gsap } from './motion.js';

/**
 * Reveals [data-reveal] elements as they enter the viewport. CSS shows them by
 * default; this sets the "from" state at runtime, so a module that never loads
 * leaves nothing hidden.
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
