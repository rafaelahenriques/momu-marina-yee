/**
 * Menu disclosure. A dropdown rather than a modal: it dismisses on Escape,
 * on a press outside it and when focus tabs past it, so it needs no focus
 * trap. The panel ships open in the markup so its links work without
 * JavaScript; this closes it on load and hands over to the toggle. State
 * lives in aria-expanded and [hidden], with no class-based copy of it.
 */
export function initMenu() {
  const nav = document.querySelector('[data-site-nav]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-menu-panel]');
  const label = toggle?.querySelector('[data-menu-label]');
  if (!nav || !toggle || !panel) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open, { moveFocus = true } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (open && moveFocus) panel.querySelector('a')?.focus();
  };

  setOpen(false, { moveFocus: false });

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    setOpen(false);
    toggle.focus();
  });

  // Following a link closes the panel behind you. One listener on the panel
  // rather than one per link.
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('pointerdown', (event) => {
    if (isOpen() && !nav.contains(event.target)) setOpen(false);
  });

  // Only when focus lands on something real elsewhere on the page. A null
  // relatedTarget means a click on dead space or a switch to another tab,
  // and neither is a reason to shut the menu.
  nav.addEventListener('focusout', (event) => {
    if (isOpen() && event.relatedTarget && !nav.contains(event.relatedTarget)) {
      setOpen(false);
    }
  });
}
