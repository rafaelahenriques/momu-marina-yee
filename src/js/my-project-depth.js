import { gsap } from './motion.js';

/**
 * Pinned depth fly-through for the M.Y. Project photographs.
 *
 * Default markup is the plain two-column grid in components.css — that is
 * what no-JS and reduced-motion visitors get, every caption in place and
 * nothing hidden. Only when this module runs does the section gain
 * .is-enhanced: the images stack in the centre of a pinned, perspective
 * stage, then recede, tilt and lift out of frame one after another as the
 * reader scrolls.
 *
 * Each image gets its own paused reveal timeline that the scrubbed master
 * *plays* rather than scrubs. That distinction matters: an elastic ease
 * dragged frame-by-frame by the scrollbar just looks like jitter, whereas
 * played at real time it reads as the intended pop.
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
    section.querySelectorAll('.my-project-depth__item')
  );
  if (!items.length) return;

  section.classList.add('is-enhanced');

  const reveals = items.map((item) =>
    gsap
      .timeline({ paused: true })
      .set(item, { autoAlpha: 1 })
      .fromTo(
        item,
        { scaleX: 0.9, scaleY: 0.9 },
        {
          scaleX: 1,
          scaleY: 1,
          // Without this the "from" scale would be applied at build time,
          // shrinking every image before the reader ever gets here.
          immediateRender: false,
          ease: 'elastic.out(2, 0.6)',
          duration: 0.5,
        },
        '<'
      )
  );

  const master = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      pin: stage,
      invalidateOnRefresh: true,
      // Third of the four pins, top to bottom — see main.js.
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
      ease: 'power1.inOut',
    }).to(
      item,
      {
        x: () => angle * 0.01 * window.innerWidth,
        y: () => -2 * window.innerHeight,
        duration: 0.6,
        ease: 'power1.in',
      },
      '<+=0.4'
    );

    master.add(tl, 0.1 * i);
  });
}
