import './css/main.css';

import { prefersReducedMotion } from './js/reduced-motion.js';
import { initMenu } from './js/menu.js';
import { initPicker } from './js/picker.js';

async function init() {
  initMenu();
  initPicker();

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
    import('./js/text-swap.js'),
    import('./js/text-scatter.js'),
    import('./js/scribble.js'),
    import('./js/poke.js'),
    import('./js/magnetic.js'),
    import('./js/corner-off.js'),
    import('./js/object-pop.js'),
  ]);

  /*
   * Pointer interactions and non-pinned animations. Nothing here measures
   * the page, so the order is free.
   */
  initHeroScatter();
  initSpotlight();
  initPickerMotion();
  initPoke();
  initMagnetic();

  /*
   * IMPORTANT:
   * Create pinned sections in DOM order.
   *
   * 1. reconstruction line reveal   (refreshPriority 5)
   * 2. upcycling marquee            (refreshPriority 4)
   * 3. limits/method line swap      (refreshPriority 3)
   * 4. M.Y. Project depth flight    (refreshPriority 2)
   * 5. sustainability horizontal    (refreshPriority 1)
   *
   * Every pin adds its own scroll distance to the page, so a pin created
   * before one that sits above it measures its start against a page height
   * that then changes — it engages early and covers the section above.
   *
   * The first three only build their triggers once document.fonts.ready has
   * resolved, so they have to be awaited: without that, the horizontal pin
   * below is created first and starts ~3000px too early, on top of
   * M.Y. Project. Each also sets a refreshPriority as a second guard.
   */
  await initTextLineReveal();
  await initTextMarquee();
  await initTextSwap();
  initMyProjectDepth();
  initHorizontalScroll();

  /*
   * Elements whose positions depend on the final page geometry
   * come AFTER all pinned sections.
   */
  initScrollReveal();
  initHeadingTracking();
  initSequenceMarquee();
  initScribble();
  initObjectPop();
  initCornerOff();
  await initTextLetterReveal();
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
