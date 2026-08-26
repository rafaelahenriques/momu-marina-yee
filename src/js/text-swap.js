import { gsap, SplitText } from './motion.js';

// Seconds between one line starting its turn and the next one starting.
const STAGGER = 0.015;

/**
 * Pinned line-by-line swap between two paragraphs, on a horizontal axis.
 *
 * The section argues that Yee's restrictions turned into her method, so the
 * first paragraph does not fade out and the second in — the same lines turn
 * over and show a different face, one after another, like a row of cards
 * being flipped.
 *
 * Default markup is two ordinary stacked paragraphs, read one after the
 * other. That is what no-JS and reduced-motion visitors get; only when this
 * module runs does the section gain .is-enhanced and stack them.
 *
 * Returns a Promise resolving once setup has completed — see
 * text-line-reveal.js for why main.js needs to await that.
 */
export function initTextSwap() {
  const section = document.querySelector('[data-text-swap]');
  const pin = section?.querySelector('[data-text-swap-pin]');
  const stage = section?.querySelector('[data-text-swap-stage]');
  const paragraphs = section?.querySelectorAll('[data-text-swap-text]');
  if (!section || !pin || !stage || paragraphs.length < 2) {
    return Promise.resolve();
  }

  return document.fonts.ready.then(() => {
    section.classList.add('is-enhanced');

    // .is-enhanced re-lays the paragraphs out on top of each other at a
    // different width. Splitting in the same frame would record line breaks
    // from the layout being replaced, so wait for the next one.
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        build(pin, stage, paragraphs);
        resolve();
      });
    });
  });
}

function build(pin, stage, paragraphs) {
  const splits = Array.from(paragraphs, (paragraph) => {
    const split = SplitText.create(paragraph, {
      type: 'lines',
      linesClass: 'text-swap__line',
    });

    // The line element is the hinge; a child inside it carries the text
    // forward in z so the turn pivots around something with depth rather
    // than flattening against the page. Moved with DOM APIs rather than
    // innerHTML so the copy is never re-parsed as markup.
    split.lines.forEach((line) => {
      const inner = document.createElement('span');
      inner.className = 'text-swap__line-inner';
      inner.append(...line.childNodes);
      line.append(inner);
    });

    return split;
  });

  // Everything after the first paragraph starts edge-on, so only the first
  // one is readable when the section arrives.
  splits.slice(1).forEach((split) => gsap.set(split.lines, { rotationY: 90 }));

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      pin: stage,
      invalidateOnRefresh: true,
      // Third of the five pins, top to bottom — see main.js.
      refreshPriority: 3,
    },
  });

  splits.forEach((split, i) => {
    const next = splits[i + 1];
    if (!next) return;

    // Both halves of the turn run together, and on the same stagger: line 3
    // of the old paragraph and line 3 of the new one share a row, so they
    // have to turn as one hinge. Give them different staggers and the two
    // sides of the row drift apart, which reads as two paragraphs printed
    // over each other rather than as one turning over.
    //
    // The stagger is short for the same reason. These are ten-line
    // paragraphs, and at the spacing a three-line pull-quote can carry, the
    // top of the new paragraph stands upright while the bottom of the old
    // one still does too. Tight enough, and the cascade stays a cascade.
    const turn = {
      stagger: STAGGER,
      duration: 1,
      ease: 'power2.inOut',
    };

    timeline
      .to(split.lines, { rotationY: -90, ...turn })
      .to(next.lines, { rotationY: 0, ...turn }, '<');
  });
}
