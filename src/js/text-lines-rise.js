import { gsap, SplitText } from './motion.js';

/**
 * Body copy that comes up a line at a time as it arrives.
 *
 * Used on the "One Corner Off" paragraphs, where the page has just spent a
 * pinned section flying photographs around and then drops the reader into
 * three plain paragraphs. They needed something, but not another pin: this
 * is the quietest thing that still reads as motion, and it costs no scroll
 * distance at all.
 *
 * Each line is set in a box that clips to it and slid up from below that
 * box's own edge, so the line arrives out of the space between the lines
 * rather than fading up out of nothing. Played rather than scrubbed —
 * three paragraphs of body copy scrubbed line by line would mean the
 * reader could park a half-risen sentence on screen and read it there.
 *
 * The .lines-rise__* elements are built by SplitText at runtime, so none of
 * this exists for a no-JS or reduced-motion visitor. They read the
 * paragraphs exactly as authored.
 *
 * Returns a Promise resolving once setup has completed — see
 * text-line-reveal.js for why main.js needs to await that.
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
