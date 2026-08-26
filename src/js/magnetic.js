import { gsap, canHover } from './motion.js';

/**
 * Elements marked [data-magnetic] lean toward the cursor, then spring back.
 * quickTo rather than gsap.to: mousemove fires dozens of times a second and
 * this reuses one tween per axis instead of spawning one per event.
 */
export function initMagnetic() {
  // A touch device has no hovering cursor to lean toward, so there is
  // nothing to attach.
  if (!canHover()) return;

  document.querySelectorAll('[data-magnetic]').forEach((element) => {
    const moveX = gsap.quickTo(element, 'x', {
      duration: 0.3,
      ease: 'power3.out',
    });
    const moveY = gsap.quickTo(element, 'y', {
      duration: 0.3,
      ease: 'power3.out',
    });

    element.addEventListener('mousemove', (event) => {
      const rect = element.getBoundingClientRect();
      moveX((event.clientX - rect.left - rect.width / 2) * 0.25);
      moveY((event.clientY - rect.top - rect.height / 2) * 0.4);
    });

    element.addEventListener('mouseleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}
