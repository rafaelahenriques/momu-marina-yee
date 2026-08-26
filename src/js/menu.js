/**
 * Menu disclosure. Expands in flow rather than covering the page, so it
 * needs no focus trap. The panel ships open in the markup so its links work
 * without JavaScript; this closes it on load and hands over to the toggle.
 * State lives in aria-expanded and [hidden], with no class-based copy of it.
 */
export function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-menu-panel]');
  if (!toggle || !panel) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open, { moveFocus = true } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open && moveFocus) panel.querySelector('a')?.focus();
  };

  setOpen(false, { moveFocus: false });

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  // Escape closes and returns focus to the control that opened it.
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
}
