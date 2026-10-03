import { gsap, SplitText, SCRUB, nextFrame } from './motion.js';

/**
 * Pinned horizontal marquee with a per-character weight pulse. Reckless Wide is
 * two static faces under one family name, so the pulse snaps between 400 and
 * 700 rather than blending.
 *
 * Resolves once setup completes — see text-line-reveal.js for why that matters.
 */
export function initTextMarquee() {
  const section = document.querySelector('[data-text-marquee]');
  const pin = section?.querySelector('[data-marquee-pin]');
  const text = section?.querySelector('[data-marquee-text]');
  if (!section || !pin || !text) return Promise.resolve();

  return document.fonts.ready.then(() => {
    section.classList.add('is-enhanced');

    // .is-enhanced resizes the sentence to 8vw on one line, so it must be
    // re-laid out before its characters can be measured.
    return nextFrame().then(() => {
      const split = SplitText.create(text, {
        type: 'chars',
        charsClass: 'marquee__char',
      });

      gsap.set(split.chars, { fontWeight: 400 });

      // Re-measured on every refresh: the text is sized in vw, so its travel
      // changes with the viewport.
      const distance = () => text.clientWidth - document.body.clientWidth;

      gsap.to(text, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB,
          pin: section.querySelector('.marquee__stage'),
          invalidateOnRefresh: true,
          // Third of the six pins, top to bottom — see main.js.
          refreshPriority: 4,
        },
      });

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB,
        },
      });

      const duration = 0.5;
      const letterTotal = duration * 2;
      const simultaneousLetters = 6;
      const offset = letterTotal / simultaneousLetters;

      split.chars.forEach((char, i) => {
        const tl = gsap.timeline();
        tl.to(char, { fontWeight: 700, duration, ease: 'power1.inOut' }).to(
          char,
          { fontWeight: 400, duration, ease: 'power1.inOut' },
        );
        master.add(tl, i * offset);
      });
    });
  });
}
