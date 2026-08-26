import { gsap, ScrollTrigger, SCRUB, canHover } from './motion.js';

/**
 * Spotlight reveal for "Move away from the spotlight."
 *
 * The overlay's clip-path radius defaults to zero in CSS, so without this
 * module it is simply invisible — no-JS and reduced-motion visitors only
 * ever see the plain base line underneath.
 *
 * The radius and the position are driven through the same three CSS custom
 * properties throughout, so there is only ever one thing controlling the
 * circle's shape.
 *
 * What moves it depends on what the reader has. With a cursor, the circle
 * follows it: the reader is holding the torch, and moving away from the
 * spotlight is something they do. On a touch screen there is no cursor to
 * follow, and the earlier version of this left a dark circle sitting
 * motionless in the middle of the section for the whole time it was on
 * screen. There, the scroll carries it instead — the circle crosses the
 * line and closes behind itself as the section passes.
 */
export function initSpotlight() {
  const section = document.querySelector('[data-spotlight]');
  const overlay = section?.querySelector('.spotlight-overlay');
  if (!section || !overlay) return;

  if (canHover()) followCursor(section, overlay);
  else followScroll(section, overlay);
}

/** Radius, in rem, of the open circle. */
const OPEN = 14;

function followCursor(section, overlay) {
  /*
   * The eased position is held on a plain object and written out to the two
   * custom properties on every frame of that tween. Two reasons for the
   * indirection: quickTo hands its target a bare number, and a clip-path
   * circle needs a unit on it; and quickTo reuses one tween per axis rather
   * than building a new one for each of the dozens of pointermove events a
   * second, which is also what gives the circle its slight lag behind the
   * cursor instead of welding it to the tip.
   */
  const spot = { x: 50, y: 50 };

  const write = () => {
    overlay.style.setProperty('--spot-x', `${spot.x}%`);
    overlay.style.setProperty('--spot-y', `${spot.y}%`);
  };

  const ease = { duration: 0.45, ease: 'power2.out', onUpdate: write };
  const moveX = gsap.quickTo(spot, 'x', ease);
  const moveY = gsap.quickTo(spot, 'y', ease);

  let onMove = null;

  const activate = () => {
    gsap.to(overlay, { opacity: 1, duration: 0.4 });
    gsap.to(overlay, {
      '--spot-r': `${OPEN}rem`,
      duration: 0.6,
      ease: 'power2.out',
    });

    onMove = (event) => {
      const rect = section.getBoundingClientRect();
      moveX(((event.clientX - rect.left) / rect.width) * 100);
      moveY(((event.clientY - rect.top) / rect.height) * 100);
    };

    section.addEventListener('pointermove', onMove, { passive: true });
  };

  const deactivate = () => {
    if (onMove) {
      section.removeEventListener('pointermove', onMove);
      onMove = null;
    }
    gsap.to(overlay, { opacity: 0, duration: 0.5 });
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top 20%',
    end: 'bottom 40%',
    onEnter: activate,
    onEnterBack: activate,
    onLeave: deactivate,
    onLeaveBack: deactivate,
  });
}

function followScroll(section, overlay) {
  /*
   * Opens as the section arrives, sweeps across the line, closes as it
   * leaves. One timeline so the three stay in step however fast the reader
   * is going, and scrubbed so it is genuinely their scroll doing it.
   *
   * Every position is given explicitly and the whole thing runs 0 → 1, so
   * the sweep occupies the entire time the section is on screen. Left to
   * append themselves, the two radius tweens would finish three quarters of
   * the way through and leave a stretch at the bottom of the section where
   * scrolling did nothing at all.
   */
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: SCRUB,
      },
    })
    .fromTo(
      overlay,
      { '--spot-r': '0rem' },
      { '--spot-r': `${OPEN}rem`, duration: 0.25, ease: 'power2.out' },
      0
    )
    .fromTo(
      overlay,
      { '--spot-x': '18%', '--spot-y': '32%' },
      { '--spot-x': '82%', '--spot-y': '68%', duration: 1 },
      0
    )
    .to(
      overlay,
      { '--spot-r': '0rem', duration: 0.25, ease: 'power2.in' },
      0.75
    );
}
