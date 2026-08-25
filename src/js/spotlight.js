import { gsap, ScrollTrigger } from './motion.js';

/**
 * Spotlight reveal for "Move away from the spotlight."
 *
 * The overlay's clip-path radius (--spot-r) defaults to 0% in CSS, so
 * without this module it is simply invisible — no-JS and reduced-motion
 * visitors only ever see the plain base line underneath.
 *
 * Both the radius and the position are driven through the same CSS custom
 * properties throughout, so there is only one thing controlling the
 * circle's shape at any time — activate() opens it, mousemove repositions
 * it, deactivate() fades it out.
 */
export function initSpotlight() {
  const section = document.querySelector('[data-spotlight]');
  const overlay = section?.querySelector('.spotlight-overlay');
  if (!section || !overlay) return;

  let onMove = null;

  const activate = () => {
    gsap.to(overlay, { opacity: 1, duration: 0.4 });
    gsap.to(overlay, { '--spot-r': '14rem', duration: 0.4, ease: 'power2.out' });

    onMove = (event) => {
      const rect = section.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      gsap.to(overlay, {
        '--spot-x': `${x}%`,
        '--spot-y': `${y}%`,
        duration: 0.3,
        ease: 'sine.out',
      });
    };

    section.addEventListener('mousemove', onMove);
  };

  const deactivate = () => {
    if (onMove) {
      section.removeEventListener('mousemove', onMove);
      onMove = null;
    }
    gsap.to(overlay, { opacity: 0, duration: 0.5 });
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top 20%',
    end: 'bottom 40%',
    onEnter: activate,
    onEnterBack: activate,
    onLeave: deactivate,
    onLeaveBack: deactivate,
  });
}