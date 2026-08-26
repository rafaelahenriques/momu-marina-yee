import { gsap } from './motion.js';

/**
 * Pokeable objects.
 *
 * Sweep the cursor across one of the collage pieces and it gets knocked
 * along with it, then swings back — the way a pinned-up scrap of cloth
 * moves if you brush past it. Yee's material came with a history of being
 * handled, so the page lets the reader handle it too.
 *
 * Every pokeable thing is decoration that the surrounding copy already
 * accounts for, so there is nothing here a reader loses by never touching
 * it. That is deliberate: this is the one interaction on the page with no
 * keyboard equivalent, and it stays that way only because nothing depends
 * on it. Touch gets a tap instead of a sweep, since there is no cursor to
 * carry a direction.
 *
 * Only the inner <img> is moved. Its wrapper carries the resting position
 * and angle from CSS, plus any scroll parallax, so the two never fight over
 * the same transform.
 */

// The cursor can jump a long way between two mousemove events — off-window
// re-entry, a flick of a trackpad — and an unbounded velocity throws the
// image clean off the page.
const clampVelocity = gsap.utils.clamp(-1400, 1400);

// How much of the cursor's own speed the object picks up.
const PICKUP = 30;

let previous = null;
let velocityX = 0;
let velocityY = 0;

export function initPoke() {
  const items = document.querySelectorAll('[data-poke-item]');
  if (!items.length) return;

  trackPointer();

  items.forEach((item) => {
    const image = item.querySelector('img') ?? item;

    item.addEventListener('mouseenter', () => poke(image, velocityX, velocityY));

    // Touch and pen: no travel direction to inherit, so the tap itself
    // supplies the nudge. Passive — this must never eat a scroll.
    item.addEventListener(
      'pointerdown',
      (event) => {
        if (event.pointerType === 'mouse') return;
        poke(image, gsap.utils.random(-500, 500), gsap.utils.random(-500, 500));
      },
      { passive: true }
    );
  });
}

/**
 * Tracked on the document rather than on the objects' container.
 *
 * The cursor's speed has to be known *before* it arrives, and the moves that
 * carry it there land on whatever is underneath — the section, a paragraph,
 * the page. A listener on the container only ever sees moves that are
 * already over an object, so the first one to arrive would always read as
 * standing still and the poke would do nothing.
 */
function trackPointer() {
  document.addEventListener(
    'mousemove',
    (event) => {
      // The first move has nothing to measure against; without this the
      // delta would be the full distance from the top-left of the viewport.
      if (previous) {
        velocityX = clampVelocity((event.clientX - previous.x) * PICKUP);
        velocityY = clampVelocity((event.clientY - previous.y) * PICKUP);
      }
      previous = { x: event.clientX, y: event.clientY };
    },
    { passive: true }
  );

  // Leaving and re-entering the window elsewhere is not a movement across
  // the page, and measuring it as one reads as a jump of several hundred
  // pixels in a single frame.
  document.addEventListener('mouseleave', () => {
    previous = null;
    velocityX = 0;
    velocityY = 0;
  });
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
      '<'
    );
}
