import { gsap } from './motion.js';

/**
 * Hero image entrance.
 *
 * Each image already sits in its final scattered position via CSS — that is
 * what no-JS and reduced-motion visitors see, a static composition with
 * nothing missing. This module only animates *into* that position: it reads
 * each image's resting place, offsets it further out and more rotated as a
 * starting point, then tweens back to 0, staggered slightly so they don't
 * all land at once.
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