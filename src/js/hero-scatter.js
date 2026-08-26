import { gsap } from './motion.js';

/**
 * Hero image entrance. Each image already sits in its final position via
 * CSS — that is what no-JS and reduced-motion visitors see. This only
 * animates into it.
 */
export function initHeroScatter() {
  const images = document.querySelectorAll('.hero__image');
  if (!images.length) return;

  gsap.from(images, {
    x: (i) => (i % 2 === 0 ? 60 : -60),
    y: 40,
    rotate: (i) => (i % 2 === 0 ? 12 : -12),
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.8,
  });
}
