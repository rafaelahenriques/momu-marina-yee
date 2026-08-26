import './css/main.css';

import { prefersReducedMotion } from './js/reduced-motion.js';
import { initMenu } from './js/menu.js';
import { initPicker } from './js/picker.js';
import { initDoodle } from './js/doodle.js';

async function init() {
  // Interactions, not animations: everything above the reduced-motion check
  // is something the reader operates, so it runs for everybody.
  initMenu();
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
    { initSequenceMarquee },
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
    import('./js/sequence-marquee.js'),
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

  // Pointer interactions and non-pinned animations. Nothing here measures
  // the page, so the order is free.
  initHeroScatter();
  initSpotlight();
  initPickerMotion();
  initPoke();
  initMagnetic();

  /*
   * IMPORTANT: create pinned sections in DOM order, top to bottom
   * (refreshPriority 5 → 1). Every pin adds its own scroll distance, so a
   * pin created before one above it measures against a page height that
   * then changes, and engages early over the section above. The first three
   * must be awaited — without that the horizontal pin is created first and
   * starts ~3000px too early, on top of M.Y. Project.
   */
  await initTextLineReveal();
  await initTextMarquee();
  await initTextSwap();
  initMyProjectDepth();
  initHorizontalScroll();

  // Elements whose positions depend on the final page geometry come AFTER
  // all pinned sections.
  initScrollReveal();
  initHeadingTracking();
  initSequenceMarquee();
  initScribble();
  initObjectPop();
  initCornerOff();
  await initTextLetterReveal();
  await initTextLinesRise();
  await initTextScatter();

  // Fonts have settled and every trigger now exists: measure once against
  // the final page height.
  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, {
    once: true,
  });
} else {
  init();
}
