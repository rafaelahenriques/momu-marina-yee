import { gsap } from './motion.js';

/**
 * Motion for the index of looks. picker.js does the real work and runs for
 * everyone, and filling in the chosen name is CSS. This adds the names being
 * set one under another as the index arrives, and, each time a look is
 * chosen, the look being uncovered from the floor up, its name written in
 * beside it, and its details laid down on the page one after another.
 */

// The angle each of the three framed details is dropped at: the same way
// as the angle the stylesheet settles it at, and steeper.
const DROP = [-9, 7, -6];

export function initPickerMotion() {
  const section = document.querySelector('.picker');
  const group = section?.querySelector('[data-picker]');
  if (!section || !group) return;

  // from() with a trigger sets the hidden state now, so the names are never
  // seen in place before they are set.
  gsap.from(group.querySelectorAll('.looks__item'), {
    yPercent: 40,
    autoAlpha: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.08,
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

    gsap.fromTo(
      panel.querySelector('.picker__figure'),
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.8,
        ease: 'power3.inOut',
        clearProps: 'clipPath',
      },
    );

    gsap.fromTo(
      panel.querySelector('.picker__credit'),
      { clipPath: 'inset(0% 100% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.7,
        delay: 0.5,
        ease: 'power2.inOut',
        clearProps: 'clipPath',
      },
    );

    gsap.from(panel.querySelectorAll('.picker__copy > :not(ul)'), {
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
      delay: 0.2,
      ease: 'back.out(1.4)',
      stagger: 0.08,
    });
  });
}
