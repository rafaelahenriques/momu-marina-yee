import { gsap } from './motion.js';

/**
 * Continuous looping strip for the detail gallery; without it, a static
 * scroll-snap strip. The track is duplicated once and the copy marked
 * aria-hidden, so a screen reader hears only the three real images. Because it
 * moves indefinitely it ships a pause button (WCAG 2.2.2) and also pauses on
 * hover and focus.
 */
export function initSequenceMarquee() {
  const container = document.querySelector('[data-sequence]');
  const track = container?.querySelector('[data-sequence-track]');
  const toggle = document.querySelector('[data-sequence-toggle]');
  if (!container || !track || !toggle) return;

  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  container.appendChild(clone);

  container.classList.add('is-marquee');

  // No longer a scrollable region a keyboard user needs to reach: the toggle
  // button is now the operable control.
  container.setAttribute('tabindex', '-1');

  const distance =
    track.scrollWidth + parseFloat(getComputedStyle(track).gap || 0);

  const tween = gsap.to([track, clone], {
    x: -distance,
    duration: 24,
    ease: 'none',
    repeat: -1,
  });

  const pause = () => tween.pause();
  const resume = () => {
    if (toggle.getAttribute('aria-pressed') !== 'true') tween.resume();
  };

  container.addEventListener('mouseenter', pause);
  container.addEventListener('mouseleave', resume);
  container.addEventListener('focusin', pause);
  container.addEventListener('focusout', resume);

  toggle.addEventListener('click', () => {
    const paused = toggle.getAttribute('aria-pressed') === 'true';
    if (paused) {
      tween.resume();
      toggle.setAttribute('aria-pressed', 'false');
      toggle.textContent = 'Pause animation';
    } else {
      tween.pause();
      toggle.setAttribute('aria-pressed', 'true');
      toggle.textContent = 'Play animation';
    }
  });
}
