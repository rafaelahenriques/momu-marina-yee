import { gsap, canHover } from './motion.js';

/**
 * Pieces laid down where the cursor travels, in the sections marked
 * [data-trail]: the cloth, the hanger, the tape — the objects the page is
 * built from — so moving across the section sets out a work table, and the
 * table clears itself behind you. Each section lists its pieces in a
 * <template>, inert until this runs.
 *
 * Pointer only. A finger has no hover to travel with, and a trail following a
 * scroll gesture would pile up under the thumb doing the scrolling.
 */

// Cursor travel between pieces, in px. Closer reads as a smear; further, as a
// few things dropped at random.
const SPACING = 110;

// How long a piece stays down before it goes, in seconds.
const LINGER = 0.9;

// Pieces on the table at once. The oldest leaves early to make room.
const MAX = 10;

export function initCursorTrail() {
  if (!canHover()) return;
  document.querySelectorAll('[data-trail]').forEach(setUp);
}

function setUp(section) {
  const template = section.querySelector('template[data-trail-items]');
  if (!template) return;

  // Imported, not cloned: a clone would belong to the template's inert
  // document and never load. Imported once here, each image is fetched in the
  // background now and every piece after is a copy from memory.
  const sources = [...template.content.querySelectorAll('img')].map((img) =>
    document.importNode(img, false),
  );
  if (!sources.length) return;

  const layer = document.createElement('div');
  layer.className = 'trail';
  layer.setAttribute('aria-hidden', 'true');
  // First, so everything else in the section paints over it.
  section.prepend(layer);

  const live = [];
  let next = 0;
  let last = null;

  const drop = (x, y, direction) => {
    const piece = document.createElement('span');
    piece.className = 'trail__piece';
    piece.append(sources[next].cloneNode());
    next = (next + 1) % sources.length;
    layer.append(piece);

    const angle = gsap.utils.random(-25, 25);
    gsap.set(piece, { x, y, xPercent: -50, yPercent: -50 });

    const timeline = gsap
      .timeline({
        onComplete: () => {
          piece.remove();
          const index = live.indexOf(timeline);
          if (index > -1) live.splice(index, 1);
        },
      })
      // Swung in from the direction of travel, then settled.
      .fromTo(
        piece,
        { scale: 0.4, rotation: angle - 30 * direction, autoAlpha: 0 },
        {
          scale: 1,
          rotation: angle,
          autoAlpha: 1,
          duration: 0.45,
          ease: 'back.out(2)',
        },
      )
      .addLabel('leave', `+=${LINGER}`)
      .to(
        piece,
        {
          y: '+=60',
          rotation: angle + 20 * direction,
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power2.in',
        },
        'leave',
      );

    live.push(timeline);
    if (live.length > MAX) live.shift().play('leave');
  };

  section.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;

      const rect = section.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (last && Math.hypot(x - last.x, y - last.y) < SPACING) return;

      const direction = last ? Math.sign(x - last.x) || 1 : 1;
      last = { x, y };
      drop(x, y, direction);
    },
    { passive: true },
  );

  // Coming back in elsewhere is not travel across the section.
  section.addEventListener('pointerleave', () => {
    last = null;
  });
}
