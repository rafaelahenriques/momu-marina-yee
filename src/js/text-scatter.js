import { gsap, ScrollTrigger, SplitText } from './motion.js';

/**
 * Scatters a short phrase away as the reader passes it. Each letter is split
 * into an outer box that keeps its place in the line and an inner glyph that
 * moves, so the sentence never reflows around the gap. The gap is the point:
 * the words leave, the scribble stays. Scrolling back up gathers them again.
 *
 * Returns a Promise resolving once setup has completed — see
 * text-line-reveal.js for why main.js awaits it.
 */
export function initTextScatter() {
  const targets = document.querySelectorAll('[data-scatter]');
  if (!targets.length) return Promise.resolve();

  // Splitting before the webfont lands measures the fallback face, so every
  // letter box would be the wrong width once it swaps in.
  return document.fonts.ready.then(() => {
    targets.forEach(setup);
  });
}

function setup(target) {
  const split = SplitText.create(target, {
    type: 'chars',
    charsClass: 'scatter__char',
    // The phrase sits inside a <strong> in running text, where SplitText's
    // default <div> per letter would be block-level content inside phrasing
    // content. SplitText also handles the accessibility side on its own: it
    // labels the wrapper with the original words and hides the letter boxes,
    // so the sentence is read whole however the letters are arranged.
    tag: 'span',
  });

  // Two nested elements per letter: the outer one holds the line's layout,
  // the inner one flies. Built with DOM APIs rather than innerHTML so the
  // copy is never re-parsed as markup.
  const glyphs = split.chars.map((char) => {
    const glyph = document.createElement('span');
    glyph.textContent = char.textContent;
    char.textContent = '';
    char.append(glyph);
    return glyph;
  });

  const scatter = () => {
    gsap.killTweensOf(glyphs);

    glyphs.forEach((glyph) => {
      gsap.to(glyph, {
        duration: gsap.utils.random(0.9, 1.3),
        physics2D: {
          velocity: gsap.utils.random(220, 460),
          // Up and outward. Straight up (-90) would send the whole phrase
          // in one direction, so the spread stays wide either side of it.
          angle: gsap.utils.random(-160, -20),
          gravity: 900,
        },
        rotation: gsap.utils.random(-220, 220),
        autoAlpha: 0,
        ease: 'none',
      });
    });
  };

  const gather = () => {
    gsap.killTweensOf(glyphs);

    gsap.to(glyphs, {
      x: 0,
      y: 0,
      rotation: 0,
      autoAlpha: 1,
      duration: 0.5,
      ease: 'power3.out',
      stagger: { each: 0.015, from: 'random' },
    });
  };

  ScrollTrigger.create({
    trigger: target,
    // Later than the scribble's own trigger (top 85%), so the strike always
    // lands before the letters leave.
    start: 'top 62%',
    onEnter: scatter,
    onLeaveBack: gather,
  });
}
