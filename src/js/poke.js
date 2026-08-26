import { gsap } from './motion.js';

/**
 * Sweep the cursor across a collage piece and it gets knocked along, then
 * swings back. Every pokeable thing is decoration the copy already accounts
 * for — which is why it can be the one interaction with no keyboard
 * equivalent. Only the inner <img> moves; its wrapper carries the resting
 * position and any scroll parallax, so the two never fight over a transform.
 */

// The cursor can jump a long way between two mousemove events — off-window
// re-entry, a flick of a trackpad — and an unbounded velocity throws the
// image clean off the page.
const clampVelocity = gsap.utils.clamp(-1400, 1400);

// How much of the cursor's own speed the object picks up.
const PICKUP = 30;

export function initPoke() {
  const items = document.querySelectorAll('[data-poke-item]');
  if (!items.length) return;

  const velocity = trackPointer();

  items.forEach((item) => {
    const image = item.querySelector('img') ?? item;

    item.addEventListener('mouseenter', () =>
      poke(image, velocity.x, velocity.y),
    );

    // Touch and pen: no travel direction to inherit, so the tap itself
    // supplies the nudge. Passive — this must never eat a scroll.
    item.addEventListener(
      'pointerdown',
      (event) => {
        if (event.pointerType === 'mouse') return;
        poke(image, gsap.utils.random(-500, 500), gsap.utils.random(-500, 500));
      },
      { passive: true },
    );
  });
}

/**
 * Tracked on the document rather than on the objects' container: the
 * cursor's speed has to be known *before* it arrives, and the moves that
 * carry it there land on whatever is underneath. A listener on the container
 * only sees moves already over an object, so the first one to arrive would
 * always read as standing still.
 */
function trackPointer() {
  const velocity = { x: 0, y: 0 };
  let previous = null;

  document.addEventListener(
    'mousemove',
    (event) => {
      // The first move has nothing to measure against; without this the
      // delta would be the full distance from the top-left of the viewport.
      if (previous) {
        velocity.x = clampVelocity((event.clientX - previous.x) * PICKUP);
        velocity.y = clampVelocity((event.clientY - previous.y) * PICKUP);
      }
      previous = { x: event.clientX, y: event.clientY };
    },
    { passive: true },
  );

  // Leaving and re-entering the window elsewhere is not a movement across
  // the page, and measuring it as one reads as a jump of several hundred
  // pixels in a single frame.
  document.addEventListener('mouseleave', () => {
    previous = null;
    velocity.x = 0;
    velocity.y = 0;
  });

  return velocity;
}

function poke(image, velocityX, velocityY) {
  const timeline = gsap.timeline({
    onComplete: () => timeline.kill(),
  });

  timeline
    .to(image, {
      inertia: {
        x: { velocity: velocityX, end: 0 },
        y: { velocity: velocityY, end: 0 },
      },
    })
    .fromTo(
      image,
      { rotate: 0 },
      {
        rotate: gsap.utils.random(-14, 14),
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      },
      '<',
    );
}
