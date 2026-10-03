import { gsap, SplitText, SCRUB, nextFrame } from './motion.js';

// Seconds between one line starting its turn and the next one starting.
const STAGGER = 0.015;

/**
 * Pinned line-by-line swap between two paragraphs: the same lines turn over
 * and show a different face, like a row of cards being flipped. Without it
 * they are two ordinary stacked paragraphs.
 *
 * Resolves once setup completes — see text-line-reveal.js for why that matters.
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

    // .is-enhanced re-lays the paragraphs out at a different width, so
    // splitting this frame would record line breaks from the old layout.
    return nextFrame().then(() => build(pin, stage, paragraphs));
  });
}

function build(pin, stage, paragraphs) {
  const splits = Array.from(paragraphs, (paragraph) => {
    const split = SplitText.create(paragraph, {
      type: 'lines',
      linesClass: 'text-swap__line',
    });

    // The line is the hinge; an inner child carries the text forward in z so
    // the turn has depth. Moved with DOM APIs, not innerHTML, so the copy is
    // never re-parsed as markup.
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
      scrub: SCRUB,
      pin: stage,
      invalidateOnRefresh: true,
      // Fifth of the seven pins, top to bottom — see main.js.
      refreshPriority: 3,
    },
  });

  splits.forEach((split, i) => {
    const next = splits[i + 1];
    if (!next) return;

    // Both halves turn together on the same stagger: line 3 of each paragraph
    // shares a row and has to move as one hinge. Different staggers, or a
    // longer one, and the row's two faces drift apart — which reads as two
    // paragraphs printed over each other rather than one turning over.
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
