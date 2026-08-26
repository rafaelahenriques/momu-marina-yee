import { gsap, ScrollTrigger } from './motion.js';

/**
 * Two-column picker: collage stage reacts to selection, choices get a
 * magnetic hover pull, whole section enters on scroll with a parallax drift
 * on the collage images.
 *
 * Only ever called when motion is allowed. picker.js (unconditional) is the
 * real accessibility layer — it toggles [hidden] on the text panels and is
 * exactly what a reduced-motion or no-JS visitor gets. The collage images
 * are aria-hidden decoration; their CSS resting positions already form a
 * collage with nothing missing if this module never runs.
 */
export function initPickerMotion() {
  const section = document.querySelector('.picker');
  const group = document.querySelector('[data-picker]');
  const stage = document.querySelector('[data-picker-stage]');
  if (!section || !group || !stage) return;

  const stageImages = stage.querySelectorAll('[data-stage-img]');

  const bringForward = (value) => {
    stageImages.forEach((img) => {
      const active = img.dataset.stageImg === value;
      gsap.to(img, {
        scale: active ? 1.08 : 0.94,
        opacity: active ? 1 : 0.55,
        zIndex: active ? 10 : 1,
        duration: 0.6,
        ease: 'power3.out',
      });
    });
  };

  // Scroll entrance: intro column and collage both settle in together.
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
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 }
      );

      gsap.fromTo(
        stageImages,
        { opacity: 0, scale: 0.85, y: 30 },
        {
          opacity: (i, target) =>
            target.dataset.stageImg ===
            group.querySelector('input:checked')?.value
              ? 1
              : 0.55,
          scale: (i, target) =>
            target.dataset.stageImg ===
            group.querySelector('input:checked')?.value
              ? 1.08
              : 0.94,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
        }
      );
    },
  });

  // Selection change: bring the matching image forward.
  group.addEventListener('change', (event) => bringForward(event.target.value));
  bringForward(group.querySelector('input:checked')?.value);

  // Slow independent parallax drift as the reader scrolls past the section —
  // each image moves at a slightly different rate for a hand-placed feel.
  stageImages.forEach((img, i) => {
    gsap.to(img, {
      y: (i % 2 === 0 ? -1 : 1) * (24 + i * 6),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
      },
    });
  });

  // Magnetic hover: labels pull slightly toward the cursor within a small
  // radius, then spring back on leave. quickTo avoids spawning a new tween
  // on every mousemove event.
  const labels = document.querySelectorAll('.picker__label');
  labels.forEach((label) => {
    const moveX = gsap.quickTo(label, 'x', { duration: 0.3, ease: 'power3.out' });
    const moveY = gsap.quickTo(label, 'y', { duration: 0.3, ease: 'power3.out' });

    label.addEventListener('mousemove', (event) => {
      const rect = label.getBoundingClientRect();
      const relX = event.clientX - rect.left - rect.width / 2;
      const relY = event.clientY - rect.top - rect.height / 2;
      moveX(relX * 0.25);
      moveY(relY * 0.4);
    });

    label.addEventListener('mouseleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}