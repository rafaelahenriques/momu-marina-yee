import { gsap } from './motion.js';

/**
 * Continuous looping strip for the One Corner Off detail gallery.
 *
 * Default markup is the static scroll-snap strip built earlier — that
 * remains exactly what no-JS and reduced-motion visitors get, since this
 * module is only called when motion is allowed.
 *
 * The track's children are duplicated once, with the duplicate marked
 * aria-hidden, so a screen reader only ever hears the three real images —
 * the seamless loop is a visual trick, not new content.
 *
 * Because this moves indefinitely, it ships with a real pause button
 * (required by WCAG 2.2.2 for any auto-moving content lasting more than a
 * few seconds) and also pauses on hover or keyboard focus, so a reader
 * looking closely at one image isn't fighting the animation.
 */
export function initSequenceMarquee() {
  const container = document.querySelector('[data-sequence]');
  const track = container?.querySelector('[data-sequence-track]');
  const toggle = document.querySelector('[data-sequence-toggle]');
  if (!container || !track || !toggle) return;

  // Duplicate the set once for a seamless loop; the copy is decorative.
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  [...clone.querySelectorAll('img')].forEach((img) => {
    img.removeAttribute('id');
  });
  container.appendChild(clone);

  container.classList.add('is-marquee');
  container.setAttribute('tabindex', '-1'); // the toggle button is the
                                              // operable control now

  const distance = track.scrollWidth + parseFloat(getComputedStyle(track).gap || 0);

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