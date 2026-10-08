import { gsap, isNarrow } from './motion.js';

/**
 * The collages and invitations, laid out across the page as a spread of
 * prints, each drifting up past the others at its own rate as the reader
 * scrolls through, the way the prints on the cover lift away. Without this,
 * the scroll-snap strip in components.css. Nothing here moves on its own, so
 * it needs no pause control.
 */

// How far each print travels, in px, from below its place to above it.
// Different for each, so the spread shifts as it passes rather than moving
// as one sheet.
const DRIFT = [120, 260, 180, 320, 220];

// Stacked in one column on a phone, neighbours sit close enough that the
// full difference in drift would slide one over the next one's caption.
const NARROW = 0.4;

export function initSequenceDrift() {
  const container = document.querySelector('[data-sequence]');
  const figures = gsap.utils.toArray(
    container?.querySelectorAll('.figure') ?? [],
  );
  if (!container || !figures.length) return;

  container.classList.add('is-spread');

  // No longer a region a keyboard reader scrolls through, so no longer a tab
  // stop, and the label loses its ", scroll horizontally".
  container.removeAttribute('tabindex');
  const label = container.getAttribute('aria-label');
  if (label) container.setAttribute('aria-label', label.split(',')[0]);

  // The figure moves; its print keeps the angle the stylesheet gives it,
  // which GSAP would otherwise fold into a transform of its own.
  figures.forEach((figure, i) => {
    const half = () =>
      (DRIFT[i % DRIFT.length] / 2) * (isNarrow() ? NARROW : 1);

    gsap.fromTo(
      figure,
      { y: () => half() },
      {
        y: () => -half(),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });
}
