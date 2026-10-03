import { gsap, SCRUB } from './motion.js';

/**
 * The opening as a scene. Pinned, the two halves of the title part and the
 * window between them widens from her eyes to the whole collage, her name
 * still brushed across it: the reader is shown a detail first, then what it
 * belongs to. Without this, the same composition, standing still.
 */

// The window's cut, as an inset on the scan: top, right, bottom, left. The
// same band .hero__window shows without script, so enhancing is invisible.
const CUT = 'inset(4% 31% 70% 0%)';

// How far the scan moves to put its own centre where the band's was, in % of
// its size. The band's centre sits 34.5% across and 17% down the scan.
const CENTRE = { xPercent: -15.5, yPercent: -33 };

export function initHeroScene() {
  const hero = document.querySelector('[data-hero]');
  const scan = hero?.querySelector('[data-hero-window] img');
  if (!hero || !scan) return;

  const [above, below] = hero.querySelectorAll('.hero__line');
  const wordmark = hero.querySelector('.hero__wordmark');

  hero.classList.add('is-enhanced');
  gsap.set(scan, { clipPath: CUT });

  // Half a screen each way clears the opened scan at any size.
  const apart = () => window.innerHeight * 0.5;

  gsap
    .timeline({
      defaults: { duration: 1, ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: SCRUB,
        invalidateOnRefresh: true,
        // First of the seven pins, top to bottom — see main.js.
        refreshPriority: 7,
      },
    })
    .to(scan, { clipPath: 'inset(0% 0% 0% 0%)', ...CENTRE }, 0)
    .to(above, { y: () => -apart() }, 0)
    .to(below, { y: apart }, 0)
    // Gone by the time they have parted, not just out of frame: the cover is
    // not clipped, so once the pin lets go a line pushed half a screen down
    // would scroll up across the paragraph that follows.
    .to([above, below], { autoAlpha: 0, duration: 0.4, ease: 'none' }, 0.5)
    // The heading carries a CSS translate and rotate that GSAP would replace,
    // so it is the image inside that grows.
    .to(wordmark, { scale: 1.12 }, 0)
    .to(hero.querySelector('.hero__meta'), { autoAlpha: 0, duration: 0.35 }, 0)
    // The pieces drift out of frame as the collage takes it over.
    .to(
      hero.querySelector('.hero__scatter'),
      { scale: 1.25, autoAlpha: 0, duration: 0.7, ease: 'power1.in' },
      0,
    )
    // Held open for a beat before the pin lets go.
    .to({}, { duration: 0.25 });
}
