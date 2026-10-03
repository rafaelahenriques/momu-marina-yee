import { gsap, SCRUB, canHover } from './motion.js';

/**
 * "Move away from the spotlight." The line is plain text in the markup; this
 * adds an aria-hidden copy on a dark layer clipped to a circle, so the overlay
 * only exists when the animation that removes it will run.
 *
 * Pinned, the circle swells until the whole screen is the spotlight, then
 * closes to a point as the reader scrolls on. Scrolling away from it is what
 * leaves the page plain again, ready for the studio that follows. On a pointer
 * device the circle is centred on the cursor, so it can be held over the line.
 */
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

  // From any centre inside the section, far enough to reach every corner.
  const cover = () => Math.hypot(section.clientWidth, section.clientHeight);

  gsap
    .timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: SCRUB,
        invalidateOnRefresh: true,
        // Second of the seven pins, top to bottom — see main.js.
        refreshPriority: 6,
      },
    })
    .fromTo(
      overlay,
      { '--spot-r': '0px' },
      { '--spot-r': () => `${cover()}px`, duration: 0.45, ease: 'power1.in' },
    )
    // Held at full, so the dark screen registers as a moment, not a flicker.
    // Then closed fast from the corners and slowly at the end, the way an
    // iris shuts on the last shot of a scene.
    .to(
      overlay,
      { '--spot-r': '0px', duration: 0.45, ease: 'power2.out' },
      '+=0.1',
    );
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

  // Only fires while the cursor is over the section, so it needs no
  // switching on and off as the reader scrolls past.
  section.addEventListener(
    'pointermove',
    (event) => {
      const rect = section.getBoundingClientRect();
      moveX(((event.clientX - rect.left) / rect.width) * 100);
      moveY(((event.clientY - rect.top) / rect.height) * 100);
    },
    { passive: true },
  );
}
