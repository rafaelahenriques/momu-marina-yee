import { gsap, SCRUB } from './motion.js';

/**
 * Pinned depth fly-through for the M.Y. Project photographs; without it, the
 * plain grid in components.css. Each image gets a paused reveal that the
 * scrubbed master *plays* rather than scrubs — an elastic ease dragged by the
 * scrollbar just looks like jitter.
 */

// Fixed rather than random: with four images a chosen spread reads better than
// chance, and the result is identical on every load, which makes it testable.
const ANGLES = [-14, 9, -6, 17];

export function initMyProjectDepth() {
  const section = document.querySelector('[data-my-project-depth]');
  const stage = section?.querySelector('[data-my-project-depth-stage]');
  if (!section || !stage) return;

  const items = gsap.utils.toArray(
    section.querySelectorAll('.my-project-depth__item'),
  );
  if (!items.length) return;

  section.classList.add('is-enhanced');

  const reveals = items.map((item) =>
    gsap.timeline({ paused: true }).set(item, { autoAlpha: 1 }).fromTo(
      item,
      { scaleX: 0.9, scaleY: 0.9 },
      {
        scaleX: 1,
        scaleY: 1,
        // Otherwise the "from" scale applies at build time, shrinking every
        // image before the reader gets here.
        immediateRender: false,
        ease: 'back.out(1.7)',
        duration: 0.6,
      },
      '<',
    ),
  );

  const master = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      // A number, not true: welded to the scrollbar, a trackpad flick would
      // teleport four photographs across the screen in one frame.
      scrub: SCRUB,
      pin: stage,
      invalidateOnRefresh: true,
      // Fifth of the six pins, top to bottom — see main.js.
      refreshPriority: 2,
    },
  });

  items.forEach((item, i) => {
    const angle = ANGLES[i % ANGLES.length];

    const tl = gsap.timeline({
      onStart: () => reveals[i].play(),
      onReverseComplete: () => {
        // Scrubbing back up must re-hide it, or it stays parked centre stage.
        reveals[i].pause(0);
        gsap.set(item, { autoAlpha: 0 });
      },
    });

    // Recede, then lift out of frame. Both distances are functions so they
    // re-measure on resize.
    tl.to(item, {
      z: () => -window.innerWidth,
      rotation: angle,
      duration: 1,
      ease: 'power2.inOut',
    }).to(
      item,
      {
        x: () => angle * 0.01 * window.innerWidth,
        y: () => -2 * window.innerHeight,
        duration: 0.6,
        ease: 'power1.in',
      },
      '<+=0.4',
    );

    master.add(tl, 0.1 * i);
  });
}
