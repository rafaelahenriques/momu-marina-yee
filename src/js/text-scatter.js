import { gsap, ScrollTrigger, SplitText } from './motion.js';

/**
 * Scatters a short phrase away as the reader passes it. Each letter is an
 * outer box that holds its place in the line and an inner glyph that moves,
 * so the sentence never reflows around the gap. The gap is the point: the
 * words leave, the scribble stays.
 *
 * Resolves once setup completes — see text-line-reveal.js for why that matters.
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
    // The phrase sits in a <strong> in running text, where SplitText's default
    // <div> per letter would be block content inside phrasing content.
    tag: 'span',
  });

  // Outer element holds the line's layout, inner one flies. Built with DOM
  // APIs, not innerHTML, so the copy is never re-parsed as markup.
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
          // Wide either side of straight up (-90), which on its own would
          // send the whole phrase in one direction.
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
    // Later than the scribble's trigger (top 85%), so the strike lands first.
    start: 'top 62%',
    onEnter: scatter,
    onLeaveBack: gather,
  });
}
