import './css/main.css';

import { prefersReducedMotion } from './js/reduced-motion.js';
import { initMenu } from './js/menu.js';
import { initNav } from './js/nav.js';
import { initPicker } from './js/picker.js';
import { initFold } from './js/fold.js';

async function init() {
  initMenu();
  initNav();
  initPicker();
  initFold();

  if (prefersReducedMotion()) return;

  const [
    { ScrollTrigger },
    { initScrollReveal },
    { initSpotlight },
    { initHorizontalScroll },
    { initHero },
    { initCursorTrail },
    { initHeadingTracking },
    { initSequenceDrift },
    { initPickerMotion },
    { initMyProjectDepth },
    { initTextLineReveal },
    { initTextMarquee },
    { initTextLetterReveal },
    { initTextLinesRise },
    { initTextSwap },
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
    import('./js/hero.js'),
    import('./js/cursor-trail.js'),
    import('./js/heading-tracking.js'),
    import('./js/sequence-drift.js'),
    import('./js/picker-motion.js'),
    import('./js/my-project-depth.js'),
    import('./js/text-line-reveal.js'),
    import('./js/text-marquee.js'),
    import('./js/text-letter-reveal.js'),
    import('./js/text-lines-rise.js'),
    import('./js/text-swap.js'),
    import('./js/scribble.js'),
    import('./js/poke.js'),
    import('./js/magnetic.js'),
    import('./js/corner-off.js'),
    import('./js/object-pop.js'),
  ]);

  initHero();

  // The topmost of the pins described below, and synchronous, so it is
  // already in DOM order here.
  initSpotlight();

  initPickerMotion();
  initPoke();
  initMagnetic();
  initCursorTrail();

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

  // Not a pin, but it lays its prints out anew, so like a pin it must exist
  // before anything below it is measured.
  initSequenceDrift();

  // Anything positioned against the final page geometry comes after the pins.
  initScrollReveal();
  initHeadingTracking();
  initScribble();
  initObjectPop();
  initCornerOff();
  await initTextLetterReveal();
  await initTextLinesRise();

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
