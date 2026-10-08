import { gsap, Draggable, SCRUB, canHover } from './motion.js';

/**
 * The cover. CSS draws the whole spread, notch and fallen corner included;
 * this plays how it got that way and what happens as the reader leaves.
 *
 * On arrival the title page is whole. Its corner is then cut, and the piece
 * drops from the notch to where the stylesheet says it lies: the story's
 * title, done to its own cover. On a pointer device the piece can be picked
 * up and thrown. Leaving, the three words slide apart and the prints lift at
 * different rates, so the spread comes undone as it goes.
 */

// Each word's drift as the cover scrolls away, in % of the screen's width.
const DRIFT = [-14, 9, -20];

// Each print's lift as the cover scrolls away, in px.
const LIFT = [-40, -110, -70];

export function initHero() {
  const hero = document.querySelector('[data-hero]');
  const title = hero?.querySelector('.hero__title');
  const piece = hero?.querySelector('[data-hero-corner]');
  if (!hero || !title || !piece) return;

  const words = gsap.utils.toArray(hero.querySelectorAll('.hero__word'));
  const prints = gsap.utils.toArray(hero.querySelectorAll('.hero__prints img'));
  const note = hero.querySelector('.hero__note');

  // Read before anything is set: where the stylesheet rests the piece, and
  // how deep the notch it came out of is.
  const rest = {
    x: gsap.getProperty(piece, 'x'),
    y: gsap.getProperty(piece, 'y'),
    rotation: gsap.getProperty(piece, 'rotation'),
  };
  const depth = `${piece.offsetWidth}px`;

  const cut = gsap
    .timeline({
      delay: 0.25,
      // Handing the notch back to the stylesheet lets a resize re-resolve
      // the clamp() it was authored as.
      onComplete: () => gsap.set(title, { clearProps: '--hero-cut' }),
    })
    // The words settle into place. Visible from the first frame: the title
    // is what the page is judged by while it loads.
    .from(words, {
      yPercent: 18,
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.08,
    })
    // The page is whole...
    .fromTo(
      title,
      { '--hero-cut': '0px' },
      { '--hero-cut': depth, duration: 0.55, ease: 'power2.inOut' },
      '-=0.35',
    )
    // ...and then it is not. The piece comes away from the notch and lands.
    .fromTo(
      piece,
      { x: 0, y: 0, rotation: 0, autoAlpha: 0 },
      { ...rest, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.6)' },
      '-=0.2',
    )
    .from(
      prints,
      {
        yPercent: 12,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
      },
      '<',
    );

  if (note) {
    cut.fromTo(
      note,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power2.inOut' },
      '-=0.4',
    );
  }

  const away = {
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: SCRUB,
  };

  words.forEach((word, i) => {
    gsap.to(word, {
      xPercent: DRIFT[i % DRIFT.length],
      ease: 'none',
      scrollTrigger: { ...away },
    });
  });

  // y, not yPercent: the arrival above owns yPercent on the prints.
  prints.forEach((print, i) => {
    gsap.to(print, {
      y: LIFT[i % LIFT.length],
      ease: 'none',
      scrollTrigger: { ...away },
    });
  });

  // Touch is left out on purpose: a thumb landing on the piece mid-swipe
  // would find the page had stopped scrolling.
  if (!canHover()) return;

  Draggable.create(piece, {
    type: 'x,y',
    bounds: hero,
    inertia: true,
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      // Picked up mid-fall, it would be dragged from where it was measured
      // before the fall moved it.
      cut.progress(1);
      this.update();
    },
    onDrag() {
      gsap.set(piece, { rotation: rest.rotation + (this.x - rest.x) * 0.12 });
    },
  });
}
