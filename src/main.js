// Entry point. A table of contents: import modules, call their init.

import './css/main.css';

import { prefersReducedMotion } from './js/reduced-motion.js';
import { initMenu } from './js/menu.js';
import { initCompare } from './js/compare.js';
import { initPicker } from './js/picker.js';

async function init() {
  // Behaviour runs regardless — these are how the page works.
  initMenu();
  initCompare();
  initPicker();

  // Decorative motion is opt-out, and loaded on demand: GSAP is by far the
  // largest dependency here, so it stays out of the initial bundle and is
  // never downloaded at all by reduced-motion visitors.
if (!prefersReducedMotion()) {
  const [
    { initScrollReveal },
    { initSpotlight },
    { initHorizontalScroll },
    { initHeroScatter },
  ] = await Promise.all([
    import('./js/scroll-reveal.js'),
    import('./js/spotlight.js'),
    import('./js/horizontal-scroll.js'),
    import('./js/hero-scatter.js'),
  ]);
  initScrollReveal();
  initSpotlight();
  initHorizontalScroll();
  initHeroScatter();
}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
