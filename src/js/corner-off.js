import { gsap, ScrollTrigger, Draggable, canHover } from './motion.js';

/**
 * The corner the reader takes off: the cut, then the pickup. The sheet and its
 * cut corner are CSS, so the still life is complete without this. Nothing is
 * written on the piece and nothing hides behind it, which is why the drag can
 * be pointer-only with no keyboard equivalent.
 */

// Duplicated as a CSS `rotate` on .corner-off__piece for the no-JS case; keep
// the two in step. They cannot read each other — GSAP writes `rotate: none`
// alongside any transform it sets.
const REST_ANGLE = 20;

// How far the piece may be thrown. Bounded to a box around the piece rather
// than the section, which also holds the image strip: a hard throw could
// otherwise park it thousands of pixels away in unrelated content.
const REACH = { minX: -170, maxX: 170, minY: -80, maxY: 240 };

export function initCornerOff() {
  const block = document.querySelector('[data-corner-off]');
  const piece = block?.querySelector('[data-corner-off-piece]');
  if (!block || !piece) return;

  const cut = cutTheCorner(block, piece);

  // Touch is left out on purpose: dragging needs touch-action: none, and a
  // thumb landing here mid-swipe would find the page had stopped scrolling.
  if (!canHover()) return;

  makeThrowable(block, piece, cut);
}

/**
 * The notch opens and the piece lifts out of it. Returns the timeline so the
 * nudge that follows can wait for it. The resting length is read before
 * anything is tweened: once GSAP sets an inline --corner-size,
 * getComputedStyle returns that instead of the authored value.
 */
function cutTheCorner(block, piece) {
  const size = getComputedStyle(block).getPropertyValue('--corner-size').trim();
  if (!size) return null;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: block,
      start: 'top 75%',
      once: true,
    },
    // Handing the property back to the stylesheet lets a resize re-resolve
    // the clamp() the corner was authored with.
    onComplete: () => gsap.set(block, { clearProps: '--corner-size' }),
  });

  timeline
    .fromTo(
      block,
      { '--corner-size': '0px' },
      { '--corner-size': size, duration: 0.7, ease: 'power2.inOut' },
    )
    .fromTo(
      piece,
      // Square to the sheet, sitting in the notch it was cut from.
      { x: '-60%', y: '55%', rotation: 0, autoAlpha: 0 },
      {
        x: 0,
        y: 0,
        rotation: REST_ANGLE,
        autoAlpha: 1,
        duration: 0.9,
        ease: 'power3.out',
      },
      // Overlapped: the piece comes away as the last of the notch opens.
      '-=0.35',
    );

  return timeline;
}

/**
 * Pick it up, throw it, let it land. Draggable animates x/y; the tilt rides on
 * top so the piece turns as it travels instead of sliding flat.
 */
function makeThrowable(block, piece, cut) {
  // One finite nudge to say the piece is loose. Anything that kept moving on
  // its own would need a pause control, as the image strip above does.
  const invite = gsap
    .timeline({ paused: true })
    .to(piece, {
      x: 10,
      rotation: REST_ANGLE + 7,
      duration: 0.5,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut',
    })
    .set(piece, { x: 0, rotation: REST_ANGLE });

  ScrollTrigger.create({
    trigger: block,
    start: 'top 55%',
    once: true,
    // The two triggers are 20% of a viewport apart, which a fast scroll covers
    // in a couple of frames, so the cut may still be lifting the piece when
    // this fires and both would write x at once. Awaiting it is a no-op if
    // the cut has already finished.
    onEnter: () => (cut ? cut.then(() => invite.play()) : invite.play()),
  });

  function tilt() {
    gsap.set(piece, { rotation: REST_ANGLE + this.x * 0.12 });
  }

  Draggable.create(piece, {
    type: 'x,y',
    bounds: REACH,
    inertia: true,
    cursor: 'grab',
    activeCursor: 'grabbing',
    onDrag: tilt,
    onThrowUpdate: tilt,
    onPress() {
      // Grabbing mid-nudge would drag from a position Draggable measured
      // before the nudge moved it.
      invite.kill();
      this.update();
    },
  });
}
