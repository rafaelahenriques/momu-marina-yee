import { gsap, ScrollTrigger, SCRUB, canHover } from './motion.js';

/**
 * Spotlight reveal. The line itself is plain readable text in the markup;
 * this adds a second aria-hidden copy on a dark layer clipped to a circle,
 * so the sentence is authored once and the overlay only exists when the
 * animation that removes it will run. With a cursor the circle follows it;
 * on touch the scroll carries it instead.
 */

/** Radius, in rem, of the open circle. */
const OPEN = 14;

export function initSpotlight() {
  const section = document.querySelector('[data-spotlight]');
  const line = section?.querySelector('.statement__text');
  if (!section || !line) return;

  const overlay = document.createElement('div');
  overlay.className = 'spotlight-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.append(line.cloneNode(true));
  section.append(overlay);

  if (canHover()) followCursor(section, overlay);
  else followScroll(section, overlay);
}

function followCursor(section, overlay) {
  /*
   * The eased position is held on a plain object and written out to the two
   * custom properties on each frame. quickTo hands its target a bare number
   * and a clip-path circle needs a unit; it also reuses one tween per axis
   * rather than building a new one for every pointermove, which is what
   * gives the circle its lag behind the cursor instead of welding it to the
   * tip.
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
   * leaves. Every position is given explicitly and the whole thing runs
   * 0 → 1, so the sweep occupies the entire time the section is on screen.
   * Left to append themselves, the two radius tweens would finish early and
   * leave a stretch at the bottom where scrolling did nothing.
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
      0,
    )
    .fromTo(
      overlay,
      { '--spot-x': '18%', '--spot-y': '32%' },
      { '--spot-x': '82%', '--spot-y': '68%', duration: 1 },
      0,
    )
    .to(
      overlay,
      { '--spot-r': '0rem', duration: 0.25, ease: 'power2.in' },
      0.75,
    );
}
