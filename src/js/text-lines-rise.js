import { gsap, SplitText } from './motion.js';

/**
 * Body copy that rises a line at a time. Played, not scrubbed: scrubbed, a
 * reader could park a half-risen sentence on screen.
 *
 * Resolves once setup completes — see text-line-reveal.js for why that matters.
 */
export function initTextLinesRise() {
  const targets = document.querySelectorAll('[data-lines-rise]');
  if (!targets.length) return Promise.resolve();

  // Splitting before the webfont lands measures the fallback face, so the line
  // breaks would be wrong once it swaps in.
  return document.fonts.ready.then(() => {
    targets.forEach((element) => {
      const split = SplitText.create(element, {
        type: 'lines',
        linesClass: 'lines-rise__line',
      });
      if (!split.lines.length) return;

      // The line clips; an inner child does the moving. Built with DOM APIs,
      // not innerHTML, so the copy is never re-parsed as markup.
      const inners = split.lines.map((line) => {
        const inner = document.createElement('span');
        inner.className = 'lines-rise__line-inner';
        inner.append(...line.childNodes);
        line.append(inner);
        return inner;
      });

      gsap.from(inners, {
        yPercent: 110,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.055,
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          once: true,
        },
      });
    });
  });
}
