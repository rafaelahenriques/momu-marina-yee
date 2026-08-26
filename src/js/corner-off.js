import { gsap, ScrollTrigger, Draggable, canHover } from './motion.js';

/**
 * The corner the reader takes off.
 *
 * The closing block is set as a sheet of paper with its top corner cut, and
 * the cut piece lying loose beside it — both states visible at once, which
 * is what the paragraph next to it describes.
 *
 * Two things happen here, in that order:
 *
 *   1. The cut. As the block arrives, --corner-size is tweened from zero to
 *      its resting length, so the corner is taken off the sheet while the
 *      reader is looking at it, and the loose piece lifts away from the
 *      notch it came out of. The property is registered as a <length> in
 *      tokens.css — that is what makes it interpolable, and what makes
 *      getComputedStyle return a resolved pixel value here rather than the
 *      literal clamp() it was authored as.
 *
 *   2. The pickup. Afterwards the piece can be dragged and thrown; where it
 *      lands is up to the reader.
 *
 * The sheet and its cut corner are CSS, so the composition is complete
 * without this module — a no-JS or reduced-motion visitor sees the same
 * still life, already cut, it just does not move. Nothing is written on the
 * piece and nothing hides behind it, which is why it is safe to leave the
 * drag as a pointer-only affordance with no keyboard equivalent.
 */

/*
 * The angle the cut piece lies at once it has come away, in degrees.
 *
 * It is also written on .corner-off__piece as a CSS `rotate`, which is what
 * a no-JS or reduced-motion visitor sees. The two have to agree, and they
 * cannot be read from one another: the moment GSAP puts a transform on this
 * element it also writes `rotate: none` alongside it, to stop the standalone
 * rotate property composing on top of the transform it is now managing. So
 * once anything here has run, the stylesheet's angle is gone and every
 * rotation below is the real angle rather than an offset from it.
 */
const REST_ANGLE = 20;

/*
 * How far the piece may be thrown, in pixels either side of where it was
 * cut. Deliberately a box around the piece rather than the section it sits
 * in: that section also holds the image strip, so bounding to it let a hard
 * throw park the piece a couple of thousand pixels away in the middle of
 * unrelated content — and let Draggable's own bounds check pin it to the
 * section's top corner, where it read as a stray graphic rather than as
 * something the reader had put there.
 */
const REACH = { minX: -170, maxX: 170, minY: -80, maxY: 240 };

export function initCornerOff() {
  const block = document.querySelector('[data-corner-off]');
  const piece = block?.querySelector('[data-corner-off-piece]');
  if (!block || !piece) return;

  const cut = cutTheCorner(block, piece);

  // Touch is left out of the drag on purpose. Making the piece draggable
  // means giving it touch-action: none, and a thumb that lands on it while
  // swiping through the page would find the page had stopped scrolling. It
  // is a decoration in a longread — not worth costing anyone a scroll. On
  // touch it stays as it is drawn, part of the still life.
  if (!canHover()) return;

  makeThrowable(block, piece, cut);
}

/**
 * The cut itself: the notch opens and the piece lifts out of it. Returns
 * the timeline, so the nudge that follows can wait for it to finish.
 *
 * Read the resting length before anything is tweened — once GSAP has put an
 * inline --corner-size on the element, getComputedStyle returns that
 * instead of the authored value.
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
    // The inline value has served its purpose once the tween has finished;
    // handing the property back to the stylesheet means a resize still
    // re-resolves the clamp() the corner was authored with.
    onComplete: () => gsap.set(block, { clearProps: '--corner-size' }),
  });

  timeline
    .fromTo(
      block,
      { '--corner-size': '0px' },
      { '--corner-size': size, duration: 0.7, ease: 'power2.inOut' }
    )
    .fromTo(
      piece,
      // Square to the sheet and sitting in the notch it was cut from.
      { x: '-60%', y: '55%', rotation: 0, autoAlpha: 0 },
      {
        x: 0,
        y: 0,
        rotation: REST_ANGLE,
        autoAlpha: 1,
        duration: 0.9,
        ease: 'power3.out',
      },
      // Overlapped rather than sequential: the piece is already coming away
      // as the last of the notch opens, the way a cut corner does.
      '-=0.35'
    );

  return timeline;
}

/**
 * Pick it up, throw it, let it land.
 *
 * Draggable animates x/y; the tilt rides along on top of it so the piece
 * turns as it travels instead of sliding flat.
 */
function makeThrowable(block, piece, cut) {
  // One nudge after the cut has settled, to say the piece is loose.
  // Deliberately finite: anything that kept moving on its own would need a
  // pause control, the way the image strip further up the page does.
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
    // The two triggers are 20% of a viewport apart, which a fast scroll
    // covers in a couple of frames — so the cut can still be lifting the
    // piece out of the notch when this fires, and both tweens would be
    // writing x at once. Awaiting the cut's timeline resolves immediately
    // if it has already finished, and waits if it has not.
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
      // Grabbing it mid-nudge would otherwise drag from a position
      // Draggable measured before the nudge moved it.
      invite.kill();
      this.update();
    },
  });
}
