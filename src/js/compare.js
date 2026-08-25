/**
 * Before/after comparison slider.
 *
 * The shape every interaction on this page should follow:
 *   1. The markup is meaningful and usable before this runs.
 *   2. The control is a real <input type="range">, so keyboard, touch and
 *      screen readers work without being retrofitted.
 *   3. JS adds the enhancement and marks the container so CSS knows.
 */
export function initCompare() {
  const roots = document.querySelectorAll('[data-compare]');

  roots.forEach((root) => {
    const range = root.querySelector('[data-compare-range]');
    if (!range) return;

    root.classList.add('is-enhanced');

    const update = () => {
      root.style.setProperty('--compare-position', `${range.value}%`);
      // A bare "50" tells a screen-reader user nothing. Say what it means.
      range.setAttribute(
        'aria-valuetext',
        `Reconstructed garment ${range.value}% revealed`
      );
    };

    range.addEventListener('input', update);
    update();
  });
}
