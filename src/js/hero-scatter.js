import { gsap } from './motion.js';

// Hero image entrance. CSS already puts each image in its final position;
// this only animates into it.
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
