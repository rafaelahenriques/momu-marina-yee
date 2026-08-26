import { gsap, SCRUB } from './motion.js';

/**
 * Pinned depth fly-through for the M.Y. Project photographs. The default is
 * the plain grid in components.css, captions and all. Each image gets a
 * paused reveal timeline that the scrubbed master *plays* rather than
 * scrubs: an elastic ease dragged by the scrollbar just looks like jitter.
 */

// Fixed tilts rather than Math.random(): with only four images a chosen
// spread reads better than chance, and the effect stays identical on every
// load, which also makes it possible to test.
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
        // Without this the "from" scale would be applied at build time,
        // shrinking every image before the reader ever gets here.
        immediateRender: false,
        // The bigger the object, the less it should spring: an overshoot
        // that reads as a pop at 22rem reads as a wobble at twice that.
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
      // scrub: true welds the flight to the scrollbar, so a trackpad flick
      // teleports four photographs across the screen in one frame. A number
      // lets them catch up — the difference between a flight and a jump cut.
      scrub: SCRUB,
      pin: stage,
      invalidateOnRefresh: true,
      // Fourth of the five pins, top to bottom — see main.js.
      refreshPriority: 2,
    },
  });

  items.forEach((item, i) => {
    const angle = ANGLES[i % ANGLES.length];

    const tl = gsap.timeline({
      onStart: () => reveals[i].play(),
      onReverseComplete: () => {
        // Scrubbing back up has to leave the image hidden again, otherwise
        // it stays parked in the centre of the stage.
        reveals[i].pause(0);
        gsap.set(item, { autoAlpha: 0 });
      },
    });

    // Recede into the perspective first, then lift up and out of frame.
    // Both distances are functions so they re-measure on resize.
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
