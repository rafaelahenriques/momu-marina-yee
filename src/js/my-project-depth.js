import { gsap, SCRUB } from './motion.js';

/**
 * The M.Y. Project, put together in front of the reader; without this, the
 * plain grid in components.css. The stage is held while the seven pieces rise
 * one after another out of the depth of the page and land where the
 * stylesheet lays them out, so the spread is assembled from what already
 * existed — the sentence above it, performed. The margin note is written in
 * last, and the page darkens into the next chapter.
 */

// How far under the page each piece starts, in viewport heights. With the
// stage's perspective at one viewport height, this is about a third of its
// size, close to the middle of the page.
const DEPTH = 2.2;

// How much further each piece is turned on the way up than where it lands.
// Fixed rather than random, so every visit builds the same spread.
const TWIST = [-22, 16, -12, 24, -18, 14, -20];

// Scroll between one piece setting off and the next, as a share of a flight.
const GAP = 0.4;

export function initMyProjectDepth() {
  const section = document.querySelector('[data-my-project-depth]');
  const stage = section?.querySelector('[data-my-project-depth-stage]');
  if (!section || !stage) return;

  const items = gsap.utils.toArray(
    section.querySelectorAll('.my-project-depth__item'),
  );
  if (!items.length) return;

  section.classList.add('is-enhanced');

  // Read once, now that .is-enhanced has applied the stylesheet's angles:
  // the end of every flight. A refresh mid-scroll would catch them mid-air.
  const rest = items.map((item) => gsap.getProperty(item, 'rotation'));

  const master = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      // A number, not true: welded to the scrollbar, a trackpad flick would
      // throw seven photographs onto the page in one frame.
      scrub: SCRUB,
      pin: stage,
      invalidateOnRefresh: true,
      // Fifth of the six pins, top to bottom — see main.js.
      refreshPriority: 2,
    },
  });

  // fromTo renders its start at once, so the pieces are already down in
  // the depth when the reader arrives, not lying on the page.
  items.forEach((item, i) => {
    master.fromTo(
      item,
      {
        z: () => -window.innerHeight * DEPTH,
        rotation: rest[i] + TWIST[i % TWIST.length],
        autoAlpha: 0,
      },
      {
        z: 0,
        rotation: rest[i],
        autoAlpha: 1,
        duration: 1,
        ease: 'power3.out',
      },
      i * GAP,
    );
  });

  const note = stage.querySelector('.my-project-depth__note');
  if (note) {
    master.fromTo(
      note,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power2.inOut' },
      '-=0.2',
    );
  }

  // A moment with the finished page before it goes dark.
  dusk(section, master, '+=0.2');
}

/**
 * The chapter after this one is dark. Fading this one to the same colours
 * while the spread is held means the reader arrives there through dusk, not
 * through a hard edge, and the prints are left lying on the colour of what
 * comes next. By now only the pinned stage is on screen; the copy above it
 * scrolled away before the pin began.
 */
function dusk(section, master, position) {
  const chapter = section.closest('.chapter');
  if (!chapter) return;

  // Read from the tokens rather than written down a second time.
  const root = getComputedStyle(document.documentElement);
  const token = (name) => root.getPropertyValue(name).trim();

  // The background is faded in on its own alpha: from plain `transparent`,
  // which is black at zero, the midpoint would be a cold grey, not a warm one.
  const [r, g, b] = gsap.utils.splitColor(token('--color-dark-bg'));

  // Ink and pen go over too, so the ruled frames and the margin note stay
  // legible on the dark page.
  master.fromTo(
    chapter,
    {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0)`,
      color: token('--color-ink'),
      '--color-pen': token('--color-pen'),
    },
    {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 1)`,
      color: token('--color-dark-ink'),
      '--color-pen': token('--color-dark-pen'),
      ease: 'power1.inOut',
      duration: 1,
    },
    position,
  );
}
