import { gsap, SplitText } from './motion.js';

/**
 * Pinned, line-by-line reveal for standalone paragraphs.
 *
 * Each split line gets an opaque cover positioned over it, which shrinks
 * away via scaleX as the reader scrolls. transform is compositor-only, so
 * this stays smooth during the scrub.
 *
 * Pin distance is sized directly off the line count (no artificial
 * minimum) so the reveal finishes right as the pin releases, with no dead
 * scroll space where the text sits fully revealed and nothing happens.
 * scrub is kept low so the motion tracks the scrollbar closely rather than
 * visibly catching up after the reader stops scrolling.
 *
 * Returns a Promise that resolves once every section's setup (including
 * the wait on document.fonts.ready) has completed. main.js awaits this
 * before doing one final ScrollTrigger.refresh(), so triggers created by
 * other, synchronous modules aren't measured against a page height that
 * later grows once fonts settle.
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
          end: () =>
            `+=${window.innerHeight * 0.8 + split.lines.length * 190}`,
          pin: stage,
          pinSpacing: true,
          scrub: 0.25,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Highest of the five pins: this is the topmost one on the page,
          // and ScrollTrigger measures in descending priority order.
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