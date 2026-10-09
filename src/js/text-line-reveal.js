import { gsap, SplitText, SCRUB_TIGHT, isNarrow } from './motion.js';

// Scroll distance spent uncovering one line. A phone fits fewer words per
// line, so the same paragraph runs to half again as many lines; at the desktop
// spacing it would hold a phone reader still for three extra screens.
const PER_LINE = { wide: 190, narrow: 120 };

/**
 * Pinned, line-by-line reveal. Each line gets an opaque cover that shrinks
 * away via scaleX — compositor-only, so it stays smooth under the scrub. Pin
 * distance is sized off the line count, so the reveal finishes exactly as the
 * pin releases.
 *
 * Resolves once setup, including document.fonts.ready, has completed. main.js
 * awaits this before its final ScrollTrigger.refresh() so other modules are
 * not measured against a page height that grows once fonts settle.
 */
export function initTextLineReveal() {
  const sections = document.querySelectorAll('[data-text-reveal]');

  const ready = Array.from(sections).map((section) => {
    const stage = section.querySelector('.text-reveal__stage');
    const paragraph = section.querySelector('[data-text-reveal-text]');
    if (!stage || !paragraph) return Promise.resolve();

    return document.fonts.ready.then(() => {
      const split = SplitText.create(paragraph, {
        type: 'lines',
        linesClass: 'text-reveal__line',
      });

      const covers = split.lines.map((line) => {
        line.style.position = 'relative';
        const cover = document.createElement('span');
        cover.className = 'text-reveal__line-cover';
        line.appendChild(cover);
        return cover;
      });

      gsap.set(covers, { scaleX: 1 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => {
            const perLine = isNarrow() ? PER_LINE.narrow : PER_LINE.wide;
            return `+=${window.innerHeight * 0.8 + split.lines.length * perLine}`;
          },
          pin: stage,
          pinSpacing: true,
          scrub: SCRUB_TIGHT,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Second of the six pins, top to bottom — see main.js. ScrollTrigger
          // measures in descending priority order.
          refreshPriority: 5,
        },
      });

      covers.forEach((cover) => {
        timeline.to(cover, {
          scaleX: 0,
          duration: 1,
          ease: 'none',
        });
      });
    });
  });

  return Promise.all(ready);
}
