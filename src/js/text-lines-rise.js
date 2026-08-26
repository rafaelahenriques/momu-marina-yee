import { gsap, SplitText } from './motion.js';

/**
 * Body copy that rises a line at a time. The quietest thing that still
 * reads as motion, and it costs no scroll distance. Played rather than
 * scrubbed — scrubbed, a reader could park a half-risen sentence on screen.
 *
 * Returns a Promise resolving once setup has completed — see
 * text-line-reveal.js for why main.js awaits it.
 */
export function initTextLinesRise() {
  const targets = document.querySelectorAll('[data-lines-rise]');
  if (!targets.length) return Promise.resolve();

  // Splitting before the webfont lands measures line breaks against the
  // fallback face, so the lines would be wrong once it swaps in.
  return document.fonts.ready.then(() => {
    targets.forEach((element) => {
      const split = SplitText.create(element, {
        type: 'lines',
        linesClass: 'lines-rise__line',
      });
      if (!split.lines.length) return;

      // The line element clips; a child inside it does the moving. Built
      // with DOM APIs rather than innerHTML so the copy is never re-parsed
      // as markup.
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
