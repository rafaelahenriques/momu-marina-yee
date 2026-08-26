import { gsap, SCRUB, SCRUB_TIGHT } from './motion.js';

/**
 * Pinned horizontal panel sequence for "Beyond sustainability".
 *
 * Default markup is a plain stacked block, read top to bottom like any
 * other section — see .horizontal__track in components.css. This only runs
 * when motion is allowed: it switches the track to a flex row, pins the
 * section, and translates the row sideways as the reader scrolls
 * vertically. ScrollTrigger reserves the extra scroll distance and unpins
 * automatically once the last panel has passed.
 *
 * The motion is driven by ordinary vertical scroll, so wheel, trackpad,
 * touch swipe, Page Down and arrow keys all move it — nothing bespoke is
 * needed for keyboard or touch support.
 *
 * Three things are layered on top of that single slide, because a wall of
 * text moving sideways at one uniform rate is the least interesting thing
 * a pinned section can do:
 *
 *   1. Decorative layers behind the panels, each crossing the screen at
 *      its own rate, so the section has depth.
 *   2. Each panel's contents lifting in as that panel arrives — driven by
 *      the slide itself via ScrollTrigger's containerAnimation, not by a
 *      second guess at where the panel is.
 *   3. A rail along the bottom showing how far through the run you are,
 *      since the page's own scrollbar is busy measuring the pin.
 */
export function initHorizontalScroll() {
  const section = document.querySelector('[data-horizontal]');
  const track = section?.querySelector('.horizontal__track');
  if (!section || !track) return;

  section.classList.add('is-enhanced');

  const panels = gsap.utils.toArray(
    section.querySelectorAll('.horizontal__panel')
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
   * hold still by default and only move by however much this puts them.
   *
   * Their travel is measured in viewport widths, not in track widths. The
   * track is five screens long, so a layer moved by even a fifth of it is
   * gone off the left edge within the first panel and never seen again —
   * which is a lot of loading for one second of decoration. A viewport
   * multiple is a distance that means something on screen: each layer
   * starts off the right edge (see .horizontal__drift-item in
   * components.css) and crosses at its own rate, so they arrive and leave
   * at different points in the run rather than moving as one sheet.
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
   * containerAnimation is what makes this honest: the panels are being
   * moved by `slide`, so their triggers are measured along that tween
   * rather than against the page. 'left 85%' means "when this panel's left
   * edge reaches 85% across the viewport" — a horizontal start and end,
   * expressed the same way a vertical one would be.
   *
   * The first panel is already past 'left 45%' before the section is
   * reached, so its tween is complete on arrival and its copy is never
   * hidden waiting for a scroll that has already happened.
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
      }
    );
  });
}
