import './css/main.css';

import { prefersReducedMotion } from './js/reduced-motion.js';
import { initMenu } from './js/menu.js';
import { initNav } from './js/nav.js';
import { initPicker } from './js/picker.js';
import { initDoodle } from './js/doodle.js';

async function init() {
  initMenu();
  initNav();
  initPicker();
  initDoodle();

  if (prefersReducedMotion()) return;

  const [
    { ScrollTrigger },
    { initScrollReveal },
    { initSpotlight },
    { initHorizontalScroll },
    { initHeroScatter },
    { initHeadingTracking },
    { initSequenceStack },
    { initPickerMotion },
    { initMyProjectDepth },
    { initTextLineReveal },
    { initTextMarquee },
    { initTextLetterReveal },
    { initTextLinesRise },
    { initTextSwap },
    { initTextScatter },
    { initScribble },
    { initPoke },
    { initMagnetic },
    { initCornerOff },
    { initObjectPop },
  ] = await Promise.all([
    import('./js/motion.js'),
    import('./js/scroll-reveal.js'),
    import('./js/spotlight.js'),
    import('./js/horizontal-scroll.js'),
    import('./js/hero-scatter.js'),
    import('./js/heading-tracking.js'),
    import('./js/sequence-stack.js'),
    import('./js/picker-motion.js'),
    import('./js/my-project-depth.js'),
    import('./js/text-line-reveal.js'),
    import('./js/text-marquee.js'),
    import('./js/text-letter-reveal.js'),
    import('./js/text-lines-rise.js'),
    import('./js/text-swap.js'),
    import('./js/text-scatter.js'),
    import('./js/scribble.js'),
    import('./js/poke.js'),
    import('./js/magnetic.js'),
    import('./js/corner-off.js'),
    import('./js/object-pop.js'),
  ]);

  initHeroScatter();
  // The topmost of the pins described below, and synchronous, so it is
  // already in DOM order here.
  initSpotlight();
  initPickerMotion();
  initPoke();
  initMagnetic();

  /*
   * Pinned sections must be created in DOM order, top to bottom
   * (refreshPriority 6 → 1). Each pin adds scroll distance, so one created
   * before a pin above it measures against a page height that then changes,
   * and engages early over the section above. The first three must be
   * awaited, or the horizontal pin is built first and starts ~3000px too
   * early, on top of M.Y. Project.
   */
  await initTextLineReveal();
  await initTextMarquee();
  await initTextSwap();
  initMyProjectDepth();
  initHorizontalScroll();

  // Not a pin — the stage is CSS sticky — but it makes its section several
  // screens taller, so like a pin it must exist before anything below it is
  // measured.
  initSequenceStack();

  // Anything positioned against the final page geometry comes after the pins.
  initScrollReveal();
  initHeadingTracking();
  initScribble();
  initObjectPop();
  initCornerOff();
  await initTextLetterReveal();
  await initTextLinesRise();
  await initTextScatter();

  // Fonts have settled and every trigger exists: measure once, against the
  // final page height.
  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, {
    once: true,
  });
} else {
  init();
}
