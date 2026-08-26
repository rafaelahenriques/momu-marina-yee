import { gsap, ScrollTrigger, SplitText } from './motion.js';

/**
 * Per-letter rotation reveal. Each letter sits in a box clipped to its own
 * bounds with the glyph pivoting from below the baseline, so swung down it
 * falls outside the clip and is simply not drawn.
 *
 * Returns a Promise resolving once setup (including document.fonts.ready)
 * has completed — see text-line-reveal.js for why main.js awaits it.
 */
export function initTextLetterReveal() {
  const targets = document.querySelectorAll('[data-letter-reveal]');
  if (!targets.length) return Promise.resolve();

  // Splitting before the webfont has loaded measures line breaks against
  // the fallback face, so the lines would be wrong once it swaps in.
  return document.fonts.ready.then(() => {
    targets.forEach((element) => {
      const split = SplitText.create(element, {
        type: 'lines,words,chars',
        linesClass: 'letter-reveal__line',
        wordsClass: 'letter-reveal__word',
        charsClass: 'letter-reveal__char',
      });

      // Two nested elements per letter: the outer one clips, the inner one
      // rotates. Built with DOM APIs rather than innerHTML so the copy is
      // never re-parsed as markup.
      split.chars.forEach((char) => {
        const glyph = document.createElement('span');
        glyph.textContent = char.textContent;
        char.textContent = '';
        char.append(glyph);
      });

      split.lines.forEach((line) => {
        const glyphs = line.querySelectorAll('.letter-reveal__char > span');
        if (!glyphs.length) return;

        gsap.set(glyphs, { rotate: -80 });

        // Played rather than scrubbed: the back eases need real time to
        // read as a settle, and a scrub would just smear them.
        const timeline = gsap.timeline({ paused: true });

        timeline
          .to(glyphs, {
            rotate: 0,
            duration: 0.4,
            stagger: 0.007,
            ease: 'back.out(1.1)',
          })
          .addLabel('visible')
          .to(glyphs, {
            rotate: 80,
            duration: 0.4,
            stagger: 0.007,
            ease: 'back.in(1.1)',
          });

        ScrollTrigger.create({
          trigger: line,
          start: 'bottom 80%',
          end: 'top 30%',
          onEnter: () => timeline.tweenTo('visible'),
          onLeave: () => timeline.play(),
          onEnterBack: () => timeline.tweenTo('visible'),
          onLeaveBack: () => timeline.reverse(),
        });
      });
    });
  });
}
