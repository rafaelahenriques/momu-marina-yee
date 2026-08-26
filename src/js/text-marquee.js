import { gsap, ScrollTrigger } from './motion.js';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/**
 * Pinned horizontal marquee for the "before upcycling" statement, with a
 * per-character weight pulse layered on top of the horizontal slide.
 *
 * Default markup is the normal centered, wrapped .statement__text — see
 * .statement--marquee in components.css. Only when this module runs
 * (motion allowed) does the section gain .is-enhanced.
 *
 * The weight pulse animates the numeric font-weight property between 400
 * and 700. Reckless Wide is registered as two static files under one
 * family name at those two weights (see base/fonts.css) — this is not a
 * variable font, so the browser's font-matching snaps to whichever static
 * face is closer at each frame rather than smoothly blending between them.
 *
 * Returns a Promise that resolves once setup (including the wait on
 * document.fonts.ready) has completed — see text-line-reveal.js for why
 * this matters for main.js's final refresh.
 */
export function initTextMarquee() {
  const section = document.querySelector('[data-text-marquee]');
  const pin = section?.querySelector('[data-marquee-pin]');
  const text = section?.querySelector('[data-marquee-text]');
  if (!section || !pin || !text) return Promise.resolve();

  return document.fonts.ready.then(() => {
    section.classList.add('is-enhanced');

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const split = SplitText.create(text, {
          type: 'chars',
          charsClass: 'statement--marquee__char',
        });

        gsap.set(split.chars, { fontWeight: 400 });

        // Measured on every refresh, not captured once: the text is sized
        // in vw, so its travel changes with the viewport.
        const distance = () => text.clientWidth - document.body.clientWidth;

        gsap.to(text, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
            pin: section.querySelector('.statement--marquee__stage'),
            invalidateOnRefresh: true,
            // Second of the four pins, top to bottom — see main.js.
            refreshPriority: 3,
          },
        });

        const master = gsap.timeline({
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
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
            { fontWeight: 400, duration, ease: 'power1.inOut' }
          );
          master.add(tl, i * offset);
        });

        resolve();
      });
    });
  });
}