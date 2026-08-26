import { gsap, SCRUB, SCRUB_TIGHT } from './motion.js';

/**
 * Pinned horizontal panel sequence. The default markup is a stacked block
 * read top to bottom. This makes the track a flex row, pins the section and
 * translates it sideways on vertical scroll — so wheel, trackpad, swipe and
 * arrow keys all drive it with nothing bespoke for keyboard or touch.
 */
export function initHorizontalScroll() {
  const section = document.querySelector('[data-horizontal]');
  const track = section?.querySelector('.horizontal__track');
  if (!section || !track) return;

  section.classList.add('is-enhanced');

  const panels = gsap.utils.toArray(
    section.querySelectorAll('.horizontal__panel'),
  );
  const drifters = gsap.utils.toArray(section.querySelectorAll('[data-drift]'));
  const bar = section.querySelector('[data-horizontal-bar]');

  const distance = () => track.scrollWidth - section.clientWidth;

  const slide = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      scrub: SCRUB,
      pin: true,
      invalidateOnRefresh: true,
      // Last of the five pins, top to bottom — see main.js.
      refreshPriority: 1,
      onUpdate: bar
        ? (self) => gsap.set(bar, { scaleX: self.progress })
        : undefined,
    },
  });

  /*
   * The layers sit inside the pinned section but outside the track, so they
   * only move by however much this moves them.
   *
   * Their travel is measured in viewport widths, not track widths: the
   * track is five screens long, so a layer moved by even a fifth of it is
   * off the left edge within the first panel and never seen again. Each
   * starts off the right edge and crosses at its own rate, so they arrive
   * and leave at different points rather than moving as one sheet.
   */
  drifters.forEach((layer) => {
    const rate = Number(layer.dataset.drift) || 1;

    gsap.to(layer, {
      x: () => -window.innerWidth * rate,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    });
  });

  /*
   * containerAnimation is what makes this honest: the panels are moved by
   * `slide`, so their triggers are measured along that tween rather than
   * against the page. 'left 85%' means "when this panel's left edge reaches
   * 85% across the viewport".
   *
   * The first panel is already past 'left 45%' before the section is
   * reached, so its copy is never hidden waiting for a scroll that has
   * already happened.
   */
  panels.forEach((panel) => {
    const parts = panel.children;
    if (!parts.length) return;

    gsap.fromTo(
      parts,
      { y: 48, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: slide,
          start: 'left 85%',
          end: 'left 45%',
          scrub: SCRUB_TIGHT,
        },
      },
    );
  });
}
