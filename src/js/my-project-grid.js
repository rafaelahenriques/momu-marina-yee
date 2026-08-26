import { gsap, ScrollTrigger } from './motion.js';

/**
 * Scroll entrance for the M.Y. Project grid.
 *
 * The hover-correct interaction is pure CSS (see components.css) and needs
 * no JavaScript at all — this module only adds an optional staggered
 * settle-in as the grid scrolls into view. Each item animates from a
 * larger, same-direction tilt down to its CSS resting rotation, so the
 * "straightening" gesture is felt once on arrival and again on hover.
 */
export function initMyProjectGrid() {
  const items = document.querySelectorAll('.my-project-grid__item');
  if (!items.length) return;

  items.forEach((item, i) => {
    const restingRotation = gsap.getProperty(item, 'rotation');

    gsap.fromTo(
      item,
      {
        opacity: 0,
        y: 30,
        rotate: restingRotation * 2.5,
      },
      {
        opacity: 1,
        y: 0,
        rotate: restingRotation,
        duration: 0.7,
        ease: 'power3.out',
        delay: i * 0.07,
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });
}