import { prefersReducedMotion } from './reduced-motion.js';

// Below this the bar always stays put: near the top there is nothing to
// gain by hiding it, and it would flicker over the hero.
const HIDE_BELOW = 200;

// Ignores sub-pixel drift and iOS rubber-banding, so only a deliberate
// move flips the bar.
const DIRECTION_THRESHOLD = 6;

// Where a section counts as the one you are reading: a third down the
// viewport, not the very top, so the switch happens as it fills the screen.
const MARKER = 0.35;

/**
 * Orientation for a page that is several thousand pixels tall: how far
 * through the story you are, which section you are in, and a bar that gets
 * out of the way while you read forward but returns the moment you scroll
 * back. Not decoration — it runs for everyone, including readers who asked
 * for reduced motion, who simply keep the bar on screen throughout.
 */
export function initNav() {
  const nav = document.querySelector('[data-site-nav]');
  const list = document.querySelector('[data-nav-links]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const current = document.querySelector('[data-nav-current]');
  if (!nav) return;

  const sections = [...(list?.querySelectorAll('a[href^="#"]') ?? [])]
    .map((link) => ({
      link,
      section: document.getElementById(decodeURIComponent(link.hash.slice(1))),
      label: [
        link.querySelector('.menu-panel__index'),
        link.querySelector('.menu-panel__label'),
      ]
        .map((part) => part?.textContent.trim())
        .filter(Boolean)
        .join(' — '),
    }))
    .filter((entry) => entry.section);

  const autoHide = !prefersReducedMotion();
  let lastY = window.scrollY;
  let active = null;
  let ticking = false;

  const isMenuOpen = () => toggle?.getAttribute('aria-expanded') === 'true';

  // scroll-padding-top and the panel's max-height both need the bar's real
  // height, which changes when the controls wrap or a webfont lands. The
  // opening also needs everything above it, breadcrumb included, to fit the
  // cover into the first screen: that is where <main> starts.
  const main = document.getElementById('main');
  const measure = () => {
    const root = document.documentElement.style;
    root.setProperty('--nav-height', `${nav.offsetHeight}px`);
    if (main) root.setProperty('--masthead-height', `${main.offsetTop}px`);
  };

  const setActive = (entry) => {
    if (entry === active) return;
    active = entry;

    for (const item of sections) {
      if (item === entry) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }

    if (current) {
      current.textContent = entry ? entry.label : '';
      current.hidden = !entry;
    }
  };

  const update = () => {
    ticking = false;

    const y = Math.max(window.scrollY, 0);
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    nav.style.setProperty(
      '--progress',
      scrollable > 0 ? `${Math.min(y / scrollable, 1)}` : '0',
    );
    nav.classList.toggle('site-nav--scrolled', y > 4);

    if (autoHide) {
      const delta = y - lastY;
      if (Math.abs(delta) > DIRECTION_THRESHOLD) {
        nav.classList.toggle(
          'site-nav--hidden',
          delta > 0 && y > HIDE_BELOW && !isMenuOpen(),
        );
        lastY = y;
      }
    }

    // The last section to have crossed the marker line is the one on screen.
    const line = window.innerHeight * MARKER;
    let found = null;
    for (const entry of sections) {
      if (entry.section.getBoundingClientRect().top <= line) found = entry;
    }
    setActive(found);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  measure();
  update();

  new ResizeObserver(measure).observe(nav);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
