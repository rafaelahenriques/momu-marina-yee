import { gsap, ScrollTrigger } from './motion.js';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/**
 * Per-letter rotation reveal for a single standalone line.
 *
 * Each letter sits in a box that clips to its own bounds, with the glyph
 * inside pivoting from below the baseline. Swung down it falls outside the
 * clip and simply is not drawn; swung upright it settles into place. Lines
 * are staggered letter by letter as they cross the viewport, and swing back
 * out once the line has travelled far enough up.
 *
 * The .letter-reveal__* elements are created by SplitText at runtime, so
 * none of the CSS for this effect matches for no-JS or reduced-motion
 * visitors — they read the paragraph exactly as it is authored, upright.
 *
 * Returns a Promise that resolves once setup (including the wait on
 * document.fonts.ready) has completed. main.js awaits it before the final
 * ScrollTrigger.refresh(), since these triggers sit below every pinned
 * section and can only be measured against the finished page height.
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
