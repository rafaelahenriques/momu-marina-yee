import './css/main.css';

import { prefersReducedMotion } from './js/reduced-motion.js';
import { initMenu } from './js/menu.js';
import { initCompare } from './js/compare.js';
import { initPicker } from './js/picker.js';

async function init() {
  initMenu();
  initCompare();
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
  ]);

  /*
   * Non-pinned / normal animations.
   */
  initHeroScatter();
  initSpotlight();
  initPickerMotion();

  /*
   * IMPORTANT:
   * Create pinned sections in DOM order.
   *
   * 1. reconstruction line reveal   (refreshPriority 4)
   * 2. upcycling marquee            (refreshPriority 3)
   * 3. M.Y. Project depth flight    (refreshPriority 2)
   * 4. sustainability horizontal    (refreshPriority 1)
   *
   * Every pin adds its own scroll distance to the page, so a pin created
   * before one that sits above it measures its start against a page height
   * that then changes — it engages early and covers the section above.
   *
   * The first two only build their triggers once document.fonts.ready has
   * resolved, so they have to be awaited: without that, the horizontal pin
   * below is created first and starts ~3000px too early, on top of
   * M.Y. Project. Each also sets a refreshPriority as a second guard.
   */
  await initTextLineReveal();
  await initTextMarquee();
  initMyProjectDepth();
  initHorizontalScroll();

  /*
   * Elements whose positions depend on the final page geometry
   * come AFTER all pinned sections.
   */
  initScrollReveal();
  initHeadingTracking();
  initSequenceMarquee();
  await initTextLetterReveal();

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