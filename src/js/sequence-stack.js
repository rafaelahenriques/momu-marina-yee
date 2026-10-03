import { gsap, SCRUB } from './motion.js';

/**
 * The detail images, laid one on another as the reader scrolls: a collage
 * built in front of them. Each piece lands on the last without covering all
 * of it, so what was already there and what came after stay visible at once —
 * the sentence just above, performed. Without this, the scroll-snap strip in
 * components.css. Nothing here moves on its own, so it needs no pause control.
 */

// Where each piece comes to rest, as a share of its own size, and at what
// angle. Fixed rather than random, so every visit builds the same pile.
const REST = [
  { xPercent: -9, yPercent: -2, rotation: -5 },
  { xPercent: 8, yPercent: 3, rotation: 4 },
  { xPercent: -2, yPercent: 0, rotation: -1.5 },
];

export function initSequenceStack() {
  const container = document.querySelector('[data-sequence]');
  const figures = gsap.utils.toArray(
    container?.querySelectorAll('.figure') ?? [],
  );
  if (!container || figures.length < 2) return;

  container.classList.add('is-stacked');

  // No longer a region a keyboard reader scrolls through, so no longer a tab
  // stop, and the label loses its ", scroll horizontally".
  container.removeAttribute('tabindex');
  const label = container.getAttribute('aria-label');
  if (label) container.setAttribute('aria-label', label.split(',')[0]);

  const rest = (i) => REST[i % REST.length];

  gsap.set(figures, {
    xPercent: (i) => rest(i).xPercent,
    yPercent: (i) => rest(i).yPercent,
    rotation: (i) => rest(i).rotation,
  });

  // .is-stacked makes the container tall and its track sticky, so this runs
  // over exactly the scroll the stage is held for.
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: SCRUB,
      invalidateOnRefresh: true,
    },
  });

  // The first piece is already down when the stage arrives, and is given a
  // moment on its own; the rest land on it. Each one swings in from a steeper
  // angle and settles to its own.
  timeline.to({}, { duration: 0.3 });

  figures.slice(1).forEach((figure, n) => {
    const i = n + 1;
    const under = figures[i - 1];

    timeline
      .fromTo(
        figure,
        { y: () => window.innerHeight, rotation: rest(i).rotation * 4 },
        {
          y: 0,
          rotation: rest(i).rotation,
          duration: 1,
          ease: 'power3.out',
        },
      )
      // The piece beneath sinks a little, and its caption gives way to the
      // new one's, so only the top piece is ever labelled on screen.
      .to(under, { scale: 0.96, duration: 1, ease: 'power1.out' }, '<')
      .to(
        under.querySelector('figcaption'),
        { autoAlpha: 0, duration: 0.3, ease: 'none' },
        '<0.4',
      )
      .to({}, { duration: 0.3 });
  });
}
