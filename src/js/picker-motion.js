import { gsap, ScrollTrigger, SCRUB } from './motion.js';

/**
 * Collage stage reacts to the selection and drifts on scroll. picker.js does
 * the real work and runs unconditionally; this is decoration. Everything here
 * moves the .picker__stage-item wrapper — the <img> inside belongs to poke.js,
 * so the two never write the same transform.
 */
export function initPickerMotion() {
  const section = document.querySelector('.picker');
  const group = document.querySelector('[data-picker]');
  const stage = document.querySelector('[data-picker-stage]');
  if (!section || !group || !stage) return;

  const items = stage.querySelectorAll('.picker__stage-item');
  const garments = stage.querySelectorAll('[data-stage-img]');
  const selected = () => group.querySelector('input:checked')?.value;

  // The loose objects are not choices, so they stay at full strength.
  const restingScale = (item) =>
    !item.dataset.stageImg || item.dataset.stageImg === selected()
      ? 1.08
      : 0.94;
  const restingOpacity = (item) =>
    !item.dataset.stageImg || item.dataset.stageImg === selected() ? 1 : 0.55;

  const bringForward = () => {
    garments.forEach((item) => {
      gsap.to(item, {
        scale: restingScale(item),
        opacity: restingOpacity(item),
        zIndex: item.dataset.stageImg === selected() ? 10 : 1,
        duration: 0.6,
        ease: 'power3.out',
      });
    });
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.fromTo(
        [
          section.querySelector('.chapter__title'),
          section.querySelector('.chapter__body'),
          group,
        ],
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 },
      );

      gsap.fromTo(
        items,
        { opacity: 0, scale: 0.85, y: 30 },
        {
          opacity: (i, target) => restingOpacity(target),
          scale: (i, target) => restingScale(target),
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
        },
      );
    },
  });

  // picker.js is registered first in main.js, so it has already flipped
  // [hidden] and the panel animated here is the one now on screen.
  group.addEventListener('change', () => {
    bringForward();

    const panel = document.querySelector(`[data-panel="${selected()}"]`);
    if (!panel) return;

    gsap.from(panel.children, {
      y: 16,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.out',
      stagger: 0.07,
    });
  });

  bringForward();

  // Each piece drifts at its own rate, for a hand-placed feel.
  items.forEach((item, i) => {
    gsap.to(item, {
      y: (i % 2 === 0 ? -1 : 1) * (24 + i * 6),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: SCRUB,
      },
    });
  });
}
