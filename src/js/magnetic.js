import { gsap } from './motion.js';

/**
 * Magnetic hover.
 *
 * Elements marked [data-magnetic] lean a little way toward the cursor while
 * it is over them, then spring back. Shared by the garment choices and the
 * visit button so the two feel like the same page.
 *
 * quickTo rather than gsap.to: mousemove fires dozens of times a second and
 * this reuses one tween per axis instead of spawning a new one each event.
 */
export function initMagnetic() {
  // A touch device has no hovering cursor to lean toward, so there is
  // nothing to attach.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

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
