import { gsap, SCRUB } from './motion.js';

/**
 * M.Y. Project, one piece at a time; without this, the plain grid in
 * components.css. The stage is held while the page goes dark and the seven
 * pieces are uncovered in turn, from the floor up, each over the last in the
 * same frame. Beside it the piece's name is set as large as the cover sets
 * its title, rolling over to the next one as it arrives. The margin note is
 * written in last, and the dark carries on into the next chapter.
 */

// Scroll per piece: one unit of the timeline is half a screen (see the
// height of .my-project-depth.is-enhanced).
const UNCOVER = 0.6;

export function initMyProjectDepth() {
  const section = document.querySelector('[data-my-project-depth]');
  const stage = section?.querySelector('[data-my-project-depth-stage]');
  if (!section || !stage) return;

  const items = gsap.utils.toArray(
    section.querySelectorAll('.my-project-depth__item'),
  );
  if (!items.length) return;

  section.classList.add('is-enhanced');
  section.style.setProperty('--pieces', items.length);

  const { count, names } = buildCaption(stage, items);
  const pad = (n) => String(n).padStart(2, '0');
  const show = (i) => {
    count.textContent = `${pad(i + 1)} / ${pad(items.length)}`;
  };
  show(0);

  const master = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      // A number, not true: welded to the scrollbar, a trackpad flick would
      // flash three pieces past in one frame.
      scrub: SCRUB,
      pin: stage,
      invalidateOnRefresh: true,
      // Fifth of the six pins, top to bottom — see main.js.
      refreshPriority: 2,
    },
    // Which piece is on show, from where the timeline is: piece i starts
    // to be uncovered at time i, and has its name by i + 0.3.
    onUpdate() {
      const i = Math.floor(this.time() - 0.3);
      show(gsap.utils.clamp(0, items.length - 1, i));
    },
  });

  // fromTo renders its start at once, so every piece is already covered
  // and every name below its mask when the reader arrives.
  items.forEach((item, i) => {
    master
      .fromTo(
        item,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: UNCOVER,
          ease: 'power3.inOut',
        },
        i,
      )
      .fromTo(
        names[i],
        { yPercent: 105 },
        { yPercent: 0, duration: 0.45, ease: 'power3.out' },
        i + 0.15,
      );

    if (i === 0) return;

    // The name before rolls up and out as this one rolls in, and the piece
    // before is put away once it is covered: the frames differ by a few
    // pixels at their edges, and the pile would show there.
    master
      .to(
        names[i - 1],
        { yPercent: -105, duration: 0.45, ease: 'power3.in' },
        i - 0.15,
      )
      .set(items[i - 1], { autoAlpha: 0 }, i + UNCOVER);
  });

  const note = stage.querySelector('.my-project-depth__note');
  if (note) {
    master.fromTo(
      note,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power2.inOut' },
      items.length - 1 + UNCOVER,
    );
  }

  // A moment with the last piece before the pin lets go.
  master.to({}, { duration: 0.5 });

  // Dark from the start, while the first piece is uncovered.
  dusk(section, master, 0);
}

/**
 * The counter and the names, built here and aria-hidden: each name is the
 * piece's own caption up to its first comma, and every caption is still in
 * the markup (and every image has its alt).
 */
function buildCaption(stage, items) {
  const caption = document.createElement('div');
  caption.className = 'my-project-depth__caption';
  caption.setAttribute('aria-hidden', 'true');

  const count = document.createElement('p');
  count.className = 'my-project-depth__count';

  const stack = document.createElement('div');
  stack.className = 'my-project-depth__names';

  const names = items.map((item) => {
    const text = item.querySelector('figcaption')?.textContent ?? '';
    const name = document.createElement('p');
    name.className = 'my-project-depth__name';
    const inner = document.createElement('span');
    inner.textContent = text.split(',')[0].trim();
    name.append(inner);
    stack.append(name);
    return inner;
  });

  caption.append(count, stack);
  stage.append(caption);
  return { count, names };
}

/**
 * The chapter after this one is dark. Fading this one to the same colours as
 * the stage is taken over means the pieces are shown on the dark the story
 * goes on in, and the reader arrives there through dusk, not through a hard
 * edge. By now only the pinned stage is on screen; the copy above it
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

  // Ink and pen go over too, so the names and the margin note stay legible
  // on the dark page.
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
      duration: 0.5,
    },
    position,
  );
}
