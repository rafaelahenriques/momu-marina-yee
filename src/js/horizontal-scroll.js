import { gsap, ScrollTrigger } from './motion.js';

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
 */
export function initHorizontalScroll() {
  const section = document.querySelector('[data-horizontal]');
  const track = section?.querySelector('.horizontal__track');
  if (!section || !track) return;

  section.classList.add('is-enhanced');

  const distance = () => track.scrollWidth - section.clientWidth;

  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      scrub: 0.6,
      pin: true,
      invalidateOnRefresh: true,
    },
  });
}