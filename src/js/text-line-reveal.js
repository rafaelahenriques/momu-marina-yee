import { gsap, ScrollTrigger } from './motion.js';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

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
 */
export function initTextLineReveal() {
  const sections = document.querySelectorAll('[data-text-reveal]');

  sections.forEach((section) => {
    const stage = section.querySelector('.text-reveal__stage');
    const paragraph = section.querySelector('[data-text-reveal-text]');
    if (!stage || !paragraph) return;

    document.fonts.ready.then(() => {
      section.classList.add('is-pinned');

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
          // Distance scales with how much text there actually is, plus a
          // small fixed settle amount — no forced minimum that outlasts
          // the reveal itself.
          end: () => `+=${window.innerHeight * 0.8 + split.lines.length * 190}`,
          pin: stage,
          pinSpacing: true,
          // Low scrub: motion tracks the scrollbar closely instead of
          // visibly drifting after the reader stops.
          scrub: 0.25,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            section.classList.toggle('is-in-view', self.isActive);
          },
        },
      });

      covers.forEach((cover) => {
        timeline.to(cover, {
          scaleX: 0,
          duration: 1,
          ease: 'none',
        });
      });

      ScrollTrigger.refresh();
    });
  });
}