import { gsap } from './motion.js';

/**
 * Motion for the look display. picker.js does the real work and runs for
 * everyone, and the stepping back of the looks not chosen is CSS. This adds
 * the lineup walking on, and, each time a look is chosen, its details being
 * laid down on the page one after another.
 */

// The angle each of the three framed details is dropped at before it
// settles square.
const DROP = [-7, 5, -4];

export function initPickerMotion() {
  const section = document.querySelector('.picker');
  const group = section?.querySelector('[data-picker]');
  if (!section || !group) return;

  // from() with a trigger sets the hidden state now, so the looks are
  // never seen standing before they walk on.
  gsap.from(section.querySelectorAll('.lineup__look'), {
    y: 60,
    autoAlpha: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: group,
      start: 'top 80%',
      once: true,
    },
  });

  // picker.js is registered first in main.js, so it has already shown the
  // panel animated here.
  group.addEventListener('change', () => {
    const value = group.querySelector('input:checked')?.value;
    const panel = section.querySelector(`[data-panel="${value}"]`);
    if (!panel) return;

    gsap.from(panel.querySelectorAll(':scope > :not(.picker__details)'), {
      y: 16,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.out',
      stagger: 0.06,
    });

    gsap.from(panel.querySelectorAll('.frame'), {
      y: 40,
      rotation: (i) => DROP[i % DROP.length],
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.4)',
      stagger: 0.08,
    });
  });
}
