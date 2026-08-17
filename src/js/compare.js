/**
 * Before/after comparison slider.
 *
 * A placeholder for your real interactive moment — kept here because it shows
 * the shape every interaction on this page should have:
 *
 *   1. The markup is meaningful and usable before this runs.
 *   2. The control is a real <input type="range">, so keyboard, touch and
 *      screen readers work for free instead of being retrofitted.
 *   3. JS only adds the enhancement, and marks the container so CSS knows.
 */
export function initCompare() {
  const roots = document.querySelectorAll('[data-compare]');

  roots.forEach((root) => {
    const range = root.querySelector('[data-compare-range]');
    if (!range) return;

    root.classList.add('is-enhanced');

    const update = () => {
      root.style.setProperty('--compare-position', `${range.value}%`);
    };

    range.addEventListener('input', update);
    update();
  });
}
