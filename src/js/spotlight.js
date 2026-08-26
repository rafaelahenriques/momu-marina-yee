import { gsap, ScrollTrigger, SCRUB, canHover } from './motion.js';

/**
 * Spotlight reveal. The line is plain text in the markup; this adds an
 * aria-hidden copy on a dark layer clipped to a circle, so the overlay only
 * exists when the animation that removes it will run.
 */

// Radius, in rem, of the open circle.
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
  // Eased on a plain object, then written out with units: quickTo hands its
  // target a bare number and clip-path needs one. Reusing one tween per axis
  // is also what gives the circle its lag behind the cursor.
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
  // Every tween is positioned explicitly so the sweep fills the whole time the
  // section is on screen. Left to append themselves the radius tweens would
  // finish early, leaving a stretch at the bottom where scrolling did nothing.
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
