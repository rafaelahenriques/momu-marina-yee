import { gsap, SCRUB } from './motion.js';

/**
 * The opening shows the method before the story names it. The archive pieces
 * land as one neat, square stack behind the name — something finished — and
 * are then knocked out to the angles CSS gives them. CSS already holds every
 * resting position; this only animates into it, and away again on scroll.
 */

// How far each piece lifts as the hero scrolls away, in % of its own height.
// Unequal rates read as unequal distances from the reader.
const DEPTH = [-70, -30, -110];

export function initHeroScatter() {
  const hero = document.querySelector('.hero');
  const title = hero?.querySelector('.hero__inner');
  const images = gsap.utils.toArray('.hero__image');
  if (!hero || !images.length) return;

  // Read before anything is set: the angle each piece is knocked out to is
  // the one the stylesheet already gave it.
  const angles = images.map((image) => gsap.getProperty(image, 'rotation'));

  // From each piece's resting centre to the hero's. Measured once, at load,
  // which is the only time the stack is on screen.
  const frame = hero.getBoundingClientRect();
  const offsets = images.map((image) => {
    const box = image.getBoundingClientRect();
    return {
      x: frame.left + frame.width / 2 - (box.left + box.width / 2),
      y: frame.top + frame.height / 2 - (box.top + box.height / 2),
    };
  });

  gsap.set(images, {
    x: (i) => offsets[i].x,
    y: (i) => offsets[i].y,
    rotation: 0,
    scale: 0.7,
    autoAlpha: 0,
  });

  gsap
    .timeline({ delay: 0.3 })
    // Squared up and settled, one on another.
    .to(images, {
      autoAlpha: 1,
      scale: 0.75,
      duration: 0.45,
      ease: 'power2.out',
      stagger: 0.1,
    })
    // Then disturbed. A fast start and a long settle reads as a knock rather
    // than as the pieces gliding to their places.
    .to(
      images,
      {
        x: 0,
        y: 0,
        rotation: (i) => angles[i],
        scale: 1,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.06,
      },
      '+=0.35',
    );

  // yPercent rather than y, which the entrance owns: the two compose instead
  // of overwriting each other.
  const away = {
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: SCRUB,
  };

  images.forEach((image, i) => {
    gsap.to(image, {
      yPercent: DEPTH[i % DEPTH.length],
      ease: 'none',
      scrollTrigger: { ...away },
    });
  });

  // The name lags behind the pieces lifting off it.
  if (title) {
    gsap.to(title, { yPercent: 35, ease: 'none', scrollTrigger: { ...away } });
  }
}
