import { gsap, SCRUB, SCRUB_TIGHT } from './motion.js';

/**
 * Pinned horizontal panel sequence. Without this the markup is a stacked block
 * read top to bottom. Driving it from vertical scroll means wheel, trackpad,
 * swipe and arrow keys all work with nothing bespoke for keyboard or touch.
 */
export function initHorizontalScroll() {
  const section = document.querySelector('[data-horizontal]');
  const track = section?.querySelector('.horizontal__track');
  if (!section || !track) return;

  section.classList.add('is-enhanced');

  const panels = gsap.utils.toArray(
    section.querySelectorAll('.horizontal__panel'),
  );
  const drifters = gsap.utils.toArray(section.querySelectorAll('[data-drift]'));
  const bar = section.querySelector('[data-horizontal-bar]');

  const distance = () => track.scrollWidth - section.clientWidth;

  const slide = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      scrub: SCRUB,
      pin: true,
      invalidateOnRefresh: true,
      // Last of the six pins, top to bottom — see main.js.
      refreshPriority: 1,
      onUpdate: bar
        ? (self) => gsap.set(bar, { scaleX: self.progress })
        : undefined,
    },
  });

  // Travel is measured in viewport widths, not track widths: the track is five
  // screens long, so a layer moved by even a fifth of it is off the left edge
  // within the first panel and never seen again.
  drifters.forEach((layer) => {
    const rate = Number(layer.dataset.drift) || 1;

    gsap.to(layer, {
      x: () => -window.innerWidth * rate,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    });
  });

  // containerAnimation measures these triggers along `slide` rather than down
  // the page, so 'left 85%' means "when this panel's left edge reaches 85%
  // across the viewport".
  panels.forEach((panel) => {
    const parts = panel.children;
    if (!parts.length) return;

    gsap.fromTo(
      parts,
      { y: 48, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: slide,
          start: 'left 85%',
          end: 'left 45%',
          scrub: SCRUB_TIGHT,
        },
      },
    );
  });

  cornerExit(section);
}

/**
 * Out of the dark chapter through its corner. As the next chapter — "One
 * Corner Off" — comes up, the bottom-right corner of this one comes away and
 * falls, and the page shows through the notch it leaves: the title performed
 * once at full scale before the reader is handed a corner of their own.
 *
 * Built here and aria-hidden, in a zero-height layer after the section rather
 * than inside it. The section clips its overflow, so a piece inside it could
 * never fall past its bottom edge.
 */
function cornerExit(section) {
  const layer = document.createElement('div');
  layer.className = 'corner-cut';
  layer.setAttribute('aria-hidden', 'true');

  const hole = document.createElement('span');
  hole.className = 'corner-cut__hole';

  // Two elements, because clip-path also clips a filter on the same box: the
  // outer one carries the shadow, the inner one the triangle.
  const piece = document.createElement('span');
  piece.className = 'corner-cut__piece';
  const face = document.createElement('span');
  face.className = 'corner-cut__face';
  piece.append(face);

  layer.append(hole, piece);

  // After the pin-spacer, so the layer's top is the section's bottom edge.
  const spacer = section.parentElement;
  (spacer?.classList.contains('pin-spacer') ? spacer : section).after(layer);

  gsap
    .timeline({
      scrollTrigger: {
        trigger: layer,
        // The moment the pin lets go and the section starts to leave.
        start: 'top bottom',
        end: 'top 25%',
        scrub: SCRUB_TIGHT,
        invalidateOnRefresh: true,
      },
    })
    // Both appear with the piece still in place, the section's own colour,
    // so nothing visibly changes until it moves.
    .fromTo(
      [hole, piece],
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.02, ease: 'none' },
    )
    // Accelerating, so it drops rather than slides.
    .to(piece, {
      x: () => window.innerWidth * 0.06,
      y: () => window.innerHeight * 0.9,
      rotation: 32,
      duration: 1,
      ease: 'power2.in',
    })
    // Gone before it lands: left where the fall ends, it would scroll back
    // into view lying across the next chapter.
    .to(piece, { autoAlpha: 0, duration: 0.25, ease: 'none' }, '-=0.25');
}
