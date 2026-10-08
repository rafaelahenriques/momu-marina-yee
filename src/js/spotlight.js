import { gsap, SCRUB } from './motion.js';

/**
 * "Move away from the spotlight, and her practice becomes easier to see."
 * Played as a camera pulling back, on a black page like the cover. A single
 * light holds the label her name is usually filed under, set as large as the
 * cover's title. Pinned, scrolling backs away from it: the light shrinks into
 * the distance and her practice comes into frame from beyond the edges, the
 * way a room does when you step back from the one thing lit in it. The second
 * half of the sentence arrives with it.
 *
 * The stage is built here and aria-hidden. Without it, the line and her
 * practice simply sit on the page together.
 */

// The name the spotlight is usually on, as the lede has just set it.
const LABEL = 'The Antwerp Six';

export function initSpotlight() {
  const section = document.querySelector('[data-spotlight]');
  const line = section?.querySelector('.statement__text');
  if (!section || !line) return;

  const rest = line.querySelector('[data-spotlight-rest]');
  const pieces = gsap.utils.toArray(
    section.querySelectorAll('.spotlight__piece'),
  );

  const { stage, light } = buildStage();
  section.append(stage);
  section.classList.add('is-enhanced');

  // The light is centred by transform, which GSAP owns from here on.
  gsap.set(light, { xPercent: -50, yPercent: -50 });

  // Where each piece starts: out past the edge of the frame along the line
  // from the centre, as if the camera were still close in. Layout positions,
  // not rects, so a refresh mid-scroll measures the same thing.
  const outward = (piece, axis) => {
    const centre =
      axis === 'x'
        ? piece.offsetLeft + piece.offsetWidth / 2 - section.clientWidth / 2
        : piece.offsetTop + piece.offsetHeight / 2 - section.clientHeight / 2;
    return centre * 0.9;
  };

  // From the line's low resting place up to the middle, where the light was.
  const toCentre = () =>
    section.clientHeight / 2 - (line.offsetTop + line.offsetHeight / 2);

  gsap
    .timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=180%',
        pin: true,
        scrub: SCRUB,
        invalidateOnRefresh: true,
        // First of the six pins, top to bottom — see main.js.
        refreshPriority: 6,
      },
    })
    // Backing away: fast at first and slower as it gets far, the way size
    // falls off with distance.
    .to(
      light,
      {
        scale: 0.08,
        y: () => -window.innerHeight * 0.22,
        duration: 0.65,
        ease: 'power3.out',
      },
      0,
    )
    .to(light, { autoAlpha: 0, duration: 0.15, ease: 'none' }, 0.55)
    .fromTo(
      pieces,
      {
        x: (i, piece) => outward(piece, 'x'),
        y: (i, piece) => outward(piece, 'y'),
        scale: 1.6,
        autoAlpha: 0,
      },
      {
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.04,
      },
      0.35,
    )
    .to(line, { y: toCentre, duration: 0.4, ease: 'power2.inOut' }, 0.5)
    // Opacity, not autoAlpha: this is half the sentence, and visibility:
    // hidden would take it out of what a screen reader hears.
    .fromTo(
      rest,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      0.6,
    )
    // Held, lit, before the pin lets go.
    .to({}, { duration: 0.2 });
}

function buildStage() {
  const stage = document.createElement('div');
  stage.className = 'spotlight__stage';
  stage.setAttribute('aria-hidden', 'true');

  const light = document.createElement('div');
  light.className = 'spotlight__light';

  const label = document.createElement('p');
  label.className = 'spotlight__label';
  label.textContent = LABEL;

  light.append(label);
  stage.append(light);
  return { stage, light };
}
