// Entry point. Vite reads this from index.html and bundles everything it imports.
// Keep this file as a table of contents: import modules, call their init, nothing else.

import './css/main.css';

import { prefersReducedMotion } from './js/motion.js';
import { initScrollReveal } from './js/scroll-reveal.js';
import { initCompare } from './js/compare.js';

function init() {
  // Interactions run regardless — they are how the user learns.
  initCompare();

  // Decorative motion is opt-out. If the user asked their OS for less motion,
  // we skip the animation and leave the content in its final, readable state.
  if (!prefersReducedMotion()) {
    initScrollReveal();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
