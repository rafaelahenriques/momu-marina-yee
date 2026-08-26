import { gsap, ScrollTrigger, Draggable } from './motion.js';

/**
 * The corner the reader takes off.
 *
 * The closing block is set as a sheet of paper with its top corner already
 * cut, and the cut piece lying loose beside it — both states visible at
 * once, which is what the paragraph next to it describes. The piece can be
 * picked up and thrown; where it lands is up to the reader.
 *
 * The sheet and its cut corner are CSS, so the composition is complete
 * without this module — a no-JS or reduced-motion visitor sees the same
 * still life, it just does not move. Nothing is written on the piece and
 * nothing hides behind it, which is why it is safe to leave as a
 * pointer-only affordance with no keyboard equivalent.
 */
export function initCornerOff() {
  const block = document.querySelector('[data-corner-off]');
  const piece = block?.querySelector('[data-corner-off-piece]');
  if (!block || !piece) return;

  // Touch is left out on purpose. Making the piece draggable means giving it
  // touch-action: none, and a thumb that lands on it while swiping through
  // the page would find the page had stopped scrolling. It is a decoration
  // in a longread — not worth costing anyone a scroll. On touch it stays as
  // it is drawn, part of the still life.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // One nudge as the section arrives, to say the piece is loose.
  // Deliberately finite: anything that kept moving on its own would need a
  // pause control, the way the image strip further up the page does.
  const invite = gsap
    .timeline({ paused: true })
    .to(piece, {
      x: 10,
      rotation: 7,
      duration: 0.45,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut',
    })
    .set(piece, { clearProps: 'transform' });

  ScrollTrigger.create({
    trigger: block,
    start: 'top 60%',
    once: true,
    onEnter: () => invite.play(),
  });

  // Draggable animates x/y; the tilt rides along on top of it so the piece
  // turns as it travels instead of sliding flat.
  function tilt() {
    gsap.set(piece, { rotation: this.x * 0.12 });
  }

  Draggable.create(piece, {
    type: 'x,y',
    // Kept inside the section so a hard throw cannot push the page wider.
    bounds: block.closest('section') ?? block.parentElement,
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
